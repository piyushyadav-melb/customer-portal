import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { createBookingThunk } from "@/redux/thunk/expert.thunk";
import { fetchProfile } from "@/service/profile.service";
import toast from "react-hot-toast";

interface Schedule {
  [key: string]: {
    isAvailable: boolean;
    slots: Array<{ start: string; end: string }>;
  };
}

interface BookAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule;
  unavailableDates: string[];
  expertName: string;
  expertId: string;
}

export const BookAppointment = ({
  isOpen,
  onClose,
  schedule,
  unavailableDates,
  expertName,
  expertId,
}: BookAppointmentProps) => {
  const dispatch = useAppDispatch();
  const { bookingLoading, bookingSuccess } = useAppSelector(
    (state) => state.expert
  );
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(undefined);
  };

  const getDaySchedule = (date: Date | undefined) => {
    if (!date) return null;
    const dayOfWeek = format(date, "EEEE");
    return schedule[dayOfWeek];
  };

  const isDateUnavailable = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return unavailableDates.includes(formattedDate);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    try {
      const profileResponse = await fetchProfile();

      if (!profileResponse.status || !profileResponse.data?.id) {
        toast.error("Please log in to book an appointment", {
          style: {
            background: "#EF4444",
            color: "#fff",
            zIndex: 9999999,
          },
        });
        return;
      }

      const scheduledAt =
        format(selectedDate, "yyyy-MM-dd") + "T" + selectedSlot + ":00Z";

      const payload = {
        expert_id: expertId,
        customer_id: profileResponse.data.id,
        scheduled_at: scheduledAt,
        duration_minutes: 60,
      };

      await dispatch(createBookingThunk(payload)).unwrap();
    } catch (error: any) { }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[1000px] p-0 gap-0 bg-[#0f172a] text-white"
        hiddenCloseIcon={true}
      >
        <div className="flex flex-col md:flex-row md:h-[500px] overflow-y-auto max-h-[90vh]">
          {/* Left Panel - Calendar */}
          <div className="w-full md:w-[65%] p-4 border-r border-gray-800">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold text-white">
                Book Appointment with {expertName}
              </DialogTitle>
              <p className="text-gray-400 mt-1 text-sm">
                Select your preferred date and time
              </p>
            </DialogHeader>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const day = format(date, "EEEE");
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0); // Reset time to start of day

                return (
                  compareDate < today || // Only disable dates before today
                  !schedule[day]?.isAvailable ||
                  isDateUnavailable(date)
                );
              }}
              className="rounded-md bg-transparent border-0"
              classNames={{
                months: "space-y-4 md:space-y-0",
                month: "space-y-4",
                caption:
                  "flex justify-center pt-1 relative items-center text-white",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-gray-400 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-purple-900/20",
                  "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                ),
                day: cn(
                  "h-9 w-9 p-0 font-normal text-white aria-selected:opacity-100",
                  "hover:bg-purple-900/50 hover:text-white",
                  "focus:bg-purple-900/50 focus:text-white focus:outline-none"
                ),
                day_selected:
                  "bg-purple-900 text-white hover:bg-purple-800 hover:text-white focus:bg-purple-900 focus:text-white",
                day_today: "bg-purple-900/10 text-white",
                day_outside: "text-gray-600 opacity-50",
                day_disabled: "text-gray-600 opacity-50",
                day_range_middle:
                  "aria-selected:bg-purple-900/20 aria-selected:text-white",
                day_hidden: "invisible",
              }}
            />
          </div>

          {/* Right Panel - Time Slots */}
          <div className="w-full md:w-[35%] p-4 bg-[#1e293b] flex flex-col">
            <h3 className="text-lg font-medium text-white mb-3">
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a Date"}
            </h3>
            <div className="flex-grow overflow-y-auto max-h-[200px] md:max-h-[350px]">
              {selectedDate ? (
                getDaySchedule(selectedDate)?.slots.length ? (
                  <div className="grid grid-cols-1 gap-2">
                    {getDaySchedule(selectedDate)?.slots.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={cn(
                          "w-full py-6 text-md border-gray-700 hover:bg-purple-900/50 hover:text-white transition-all",
                          selectedSlot === slot.start &&
                          "bg-purple-900 border-purple-700 text-white"
                        )}
                        onClick={() => setSelectedSlot(slot.start)}
                      >
                        {slot.start} - {slot.end}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No available slots for this date
                  </p>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">Please select a date first</p>
                </div>
              )}
            </div>

            {/* Booking Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedSlot || bookingLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
