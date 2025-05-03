"use client";
import React, { useEffect, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchExpertsThunk } from "@/redux/thunk/expert.thunk";
import { setFilters } from "@/redux/slice/expert.slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries, states, cities } from "@/utils/locations";
import { categories } from "@/utils/categories";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookAppointment } from "./book-appointment";
import { closePopup } from "@/service/modal.service";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import debounce from "lodash/debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ChatPopup } from "@/components/chat/chat-popup";

const FindExpert = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { experts, loading, error, filters, pagination } = useAppSelector(
    (state: RootState) => state.expert
  );
  const [selectedCountry, setSelectedCountry] = React.useState("");
  const [selectedState, setSelectedState] = React.useState("");
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedBookingExpert, setSelectedBookingExpert] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const debouncedFetchExperts = useCallback(
    debounce((params: any) => {
      dispatch(fetchExpertsThunk(params));
    }, 200),
    [dispatch]
  );

  useEffect(() => {
    // Only call API if search text is empty or has 3+ characters
    if (!filters.searchText || filters.searchText.length >= 3) {
      const currentFilters = {
        searchText: filters.searchText || "",
        country: filters.country || "",
        state: filters.state || "",
        city: filters.city || "",
        gender: filters.gender || "",
        consultation_language: filters.consultation_language || "",
        category: filters.category || "",
        min_consultation_charge: filters.min_consultation_charge || "",
        page: filters.page || 1,
        perPage: filters.perPage || 10,
      };
      debouncedFetchExperts(currentFilters);
    }
  }, [
    filters.searchText,
    filters.country,
    filters.state,
    filters.city,
    filters.gender,
    filters.consultation_language,
    filters.category,
    filters.min_consultation_charge,
    filters.page,
    debouncedFetchExperts,
  ]);

  const handleFilterChange = (key: string, value: string) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
      page: 1,
    };
    dispatch(setFilters(updatedFilters));
  };

  const handleCountryChange = (value: string) => {
    const updatedFilters = {
      ...filters,
      country: value,
      state: "",
      city: "",
      page: 1,
    };
    setSelectedCountry(value);
    setSelectedState("");
    dispatch(setFilters(updatedFilters));
  };

  const handleStateChange = (value: string) => {
    const updatedFilters = {
      ...filters,
      state: value,
      city: "",
      page: 1,
    };
    setSelectedState(value);
    dispatch(setFilters(updatedFilters));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleVideoClose = () => {
    setIsVideoOpen(false);
    setSelectedExpert(null);
  };

  const handleBookingClose = async () => {
    setIsBookingOpen(false);
    setSelectedBookingExpert(null);
    await closePopup();
  };

  const handleMessageClick = (expert: any) => {
    setSelectedExpert(expert);
    setIsChatOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Find an Expert</h1>

      {/* Filters Section */}
      <div className="space-y-4 mb-8">
        {/* First Row */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <div className="col-span-3 md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search experts... (min 3 characters)"
                value={filters.searchText}
                onChange={(e) =>
                  handleFilterChange("searchText", e.target.value)
                }
                className="pl-10 w-full bg-[#0f172a] border-[#1e293b] text-white h-[42px] rounded-md focus:ring-2 focus:ring-purple-500/30 focus:border-transparent"
              />
            </div>
          </div>

          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px]"
            value={filters.country}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Country</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>

          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px]"
            value={filters.state}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={!selectedCountry}
          >
            <option value="">State</option>
            {selectedCountry &&
              states[selectedCountry]?.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
          </select>

          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px]"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px]"
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            disabled={!selectedState}
          >
            <option value="">City</option>
            {selectedState &&
              cities[selectedState]?.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
          </select>

          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px]"
            value={filters.min_consultation_charge}
            onChange={(e) =>
              handleFilterChange("min_consultation_charge", e.target.value)
            }
          >
            <option value="">Price</option>
            <option value="500">₹500</option>
            <option value="1000">₹1,000</option>
            <option value="1500">₹1,500</option>
            <option value="2000">₹2,000</option>
            <option value="2500">₹2,500</option>
            <option value="3000">₹3,000</option>
          </select>

          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px] text-sm md:text-base"
            value={filters.gender}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
          >
            <option value="">Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            className="w-full p-2.5 bg-[#0f172a] border border-[#1e293b] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-[42px] text-sm md:text-base"
            value={filters.consultation_language}
            onChange={(e) =>
              handleFilterChange("consultation_language", e.target.value)
            }
          >
            <option value="">Language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Experts Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : experts?.length === 0 ? (
        <div className="text-center text-muted-foreground">
          {filters.searchText.length > 0 && filters.searchText.length < 3
            ? "Please enter at least 3 characters to search"
            : "No experts found"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts?.map((expert) => (
            <div
              key={expert.id}
              className="relative h-[400px] rounded-lg overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={expert.profile_picture_url}
                  alt={expert.name}
                  fill
                  className="object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Play Button Overlay */}
              <button
                onClick={() => {
                  setSelectedExpert(expert);
                  setIsVideoOpen(true);
                }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 hover:bg-black/60 transition-colors">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </button>

              {/* Verified Badge */}
              {expert.is_expert_verified && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white rounded-full p-1.5 shadow-lg">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="space-y-2">
                  <h3
                    className="text-2xl font-semibold cursor-pointer hover:underline"
                    onClick={() => router.push(`/expert/${expert.id}`)}
                  >
                    {expert.name}
                  </h3>
                  <p className="text-gray-300">
                    {expert.city}, {expert.state}, {expert.country}
                  </p>
                  <p className="text-xl font-semibold text-primary-foreground">
                    ₹{expert.consultation_charge} /hr
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleMessageClick(expert)}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Message
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedBookingExpert(expert);
                        setIsBookingOpen(true);
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={handleVideoClose}>
        <DialogContent className="max-w-4xl" hiddenCloseIcon={true}>
          <DialogHeader>
            <DialogTitle>{selectedExpert?.intro_video_title}</DialogTitle>
          </DialogHeader>
          <video
            src={selectedExpert?.intro_video_url}
            className="w-full"
            controls
            autoPlay
            playsInline
          />
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleVideoClose}>
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Calendar */}
      {selectedBookingExpert && (
        <BookAppointment
          isOpen={isBookingOpen}
          onClose={handleBookingClose}
          schedule={
            selectedBookingExpert.schedule
              ? JSON.parse(selectedBookingExpert.schedule)
              : {}
          }
          unavailableDates={selectedBookingExpert.unavailable_dates || []}
          expertName={selectedBookingExpert.name}
          expertId={selectedBookingExpert.id}
        />
      )}

      {selectedExpert && (
        <ChatPopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          expert={{
            id: selectedExpert.id,
            name: selectedExpert.name,
            profile_picture_url: selectedExpert.profile_picture_url,
          }}
        />
      )}
    </div>
  );
};

export default FindExpert;
