import { useEffect, useState } from "react";
import { fetchExpertDetails } from "@/redux/thunk/expert.thunk";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Star, Check, Copy, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { closePopup } from "@/service/modal.service";
import { BookAppointment } from "../expert/book-appointment";
import toast from "react-hot-toast";

export const ExpertDetailsPublic = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { expertDetails, loading, error } = useAppSelector(
        (state) => state.expert
    );
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchExpertDetails(id as string));
        }
    }, [dispatch, id]);

    const handleVideoClose = async () => {
        setIsVideoOpen(false);
        await closePopup();
    };

    const handleBookingClose = async () => {
        setIsBookingOpen(false);
        await closePopup();
    };

    const handleMessageClick = () => {
        if (expertDetails?.id) {
            router.push(`/chat?expertId=${expertDetails.id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-gray-600">Loading expert details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!expertDetails) {
        return <div>Expert not found</div>;
    }

    const schedule = expertDetails?.schedule
        ? JSON.parse(expertDetails?.schedule)
        : {};

    const handleShareClick = async () => {
        try {
            const currentUrl = window.location.href;

            // Check if the Web Share API is supported
            if (navigator.share) {
                await navigator.share({
                    title: `${expertDetails?.name} - Expert Profile`,
                    text: `Check out ${expertDetails?.name}'s expert profile`,
                    url: currentUrl,
                });
            } else {
                // Fallback to clipboard API
                await navigator.clipboard.writeText(currentUrl);
                setIsCopied(true);
                toast.success("Link copied to clipboard!");

                // Reset the copied state after 2 seconds
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="md:col-span-3 space-y-4">
                    {/* Work Video */}
                    <div className="bg-card rounded-lg p-4 shadow-lg">
                        <div className="relative aspect-[9/16] w-full rounded-lg overflow-hidden">
                            <video
                                src={expertDetails?.intro_video_url}
                                className="absolute inset-0 w-full h-full object-cover"
                                poster={expertDetails?.profile_picture_url}
                            />
                            <button
                                onClick={() => setIsVideoOpen(true)}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                            >
                                <Play className="w-12 h-12 text-white" />
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <h1 className="text-xl font-bold">{expertDetails?.name}</h1>
                            <p className="text-gray-600 text-sm mt-1">
                                {expertDetails?.job_title}
                            </p>
                            <p className="text-primary font-semibold mt-2">
                                ₹{expertDetails?.consultation_charge} /hr
                            </p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleShareClick}
                        disabled={isCopied}
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Share Expert
                            </>
                        )}
                    </Button>


                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleMessageClick}
                    >
                        Message
                    </Button>

                    {/* Book Now Button */}
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => setIsBookingOpen(true)}
                    >
                        Book Now
                    </Button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9">
                    <div className="space-y-8">
                        {/* Description Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                            <p className="text-gray-700">
                                {expertDetails.description || "No description available"}
                            </p>
                        </div>

                        {/* Profile Section */}
                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-600">Location</h3>
                                    <p>
                                        {expertDetails.city}, {expertDetails.state},{" "}
                                        {expertDetails.country}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-600">
                                        Consultation Language
                                    </h3>
                                    <p>{expertDetails.consultation_language}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {expertDetails.keywords && expertDetails.keywords.length > 0 ? (
                                    expertDetails.keywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium"
                                        >
                                            {keyword}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">No keywords available</span>
                                )}
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Documents</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* License */}
                                <div className="space-y-2">
                                    <h3 className="font-medium text-gray-600">License</h3>
                                    {expertDetails.license_url ? (
                                        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200">
                                            <Image
                                                src={expertDetails.license_url}
                                                alt="License"
                                                fill
                                                className="object-contain"
                                            />
                                            <a
                                                href={expertDetails.license_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                                            <p className="text-gray-500">No license available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Certificate */}
                                <div className="space-y-2">
                                    <h3 className="font-medium text-gray-600">Certificate</h3>
                                    {expertDetails.certificate_url ? (
                                        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200">
                                            <Image
                                                src={expertDetails.certificate_url}
                                                alt="Certificate"
                                                fill
                                                className="object-contain"
                                            />
                                            <a
                                                href={expertDetails.certificate_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                                            <p className="text-gray-500">No certificate available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ratings Section */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Ratings & Reviews</h2>
                            <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                                <div className="text-center">
                                    <Star className="w-12 h-12 mx-auto text-gray-400" />
                                    <p className="mt-2 text-gray-500">No ratings available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Dialog */}
            <Dialog open={isVideoOpen} onOpenChange={handleVideoClose}>
                <DialogContent className="max-w-4xl" hiddenCloseIcon={true}>
                    <DialogHeader>
                        <DialogTitle>{expertDetails.intro_video_title}</DialogTitle>
                    </DialogHeader>
                    <video
                        src={expertDetails.intro_video_url}
                        className="w-full"
                        controls
                        autoPlay
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
            <BookAppointment
                isOpen={isBookingOpen}
                onClose={handleBookingClose}
                schedule={schedule}
                unavailableDates={expertDetails.unavailable_dates || []}
                expertName={expertDetails.name}
                expertId={expertDetails.id}
            />
        </div>
    );
};
