"use client";

import React from "react";
import { motion } from "framer-motion";
import type {
  Member,
  AcademicService,
  Award,
  Sponsorship,
} from "@prisma/client";
import type { PublicationInfo } from "@/lib/types";
import { themeColors } from "@/styles/theme";

// Import Section Components
import LabLeaderHeader from "@/components/lab_leader/LabLeaderHeader";
import ResearchInterestsSection from "@/components/lab_leader/ResearchInterestsSection";
import PublicationsSection from "@/components/lab_leader/PublicationsSection";
import AcademicServicesSection from "@/components/lab_leader/AcademicServicesSection";
import AwardsSection from "@/components/lab_leader/AwardsSection";
import SponsorshipsSection from "@/components/lab_leader/SponsorshipsSection";

// Define Props Interface to receive data from the parent Server Component
interface LabLeaderPageContentProps {
  leaderData: Member | null;
  publications: PublicationInfo[];
  pubError: string | null;
  featuredServices: AcademicService[];
  detailedServices: AcademicService[];
  featuredAwards: Award[];
  detailedAwards: Award[];
  featuredSponsorships: Sponsorship[];
  detailedSponsorships: Sponsorship[];
  dataError: string | null;
}

// Animation Variants (can be refined)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Adjust stagger time as needed
      delayChildren: 0.1, // Initial delay before first child animates
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 15 }, // Adjust physics
  },
};

const LabLeaderPageContent: React.FC<LabLeaderPageContentProps> = ({
  leaderData,
  publications,
  pubError,
  featuredServices,
  detailedServices,
  featuredAwards,
  detailedAwards,
  featuredSponsorships,
  detailedSponsorships,
  dataError,
}) => {
  return (
    // Root element for the content, applying theme background
    <div className={`${themeColors.themePageBg ?? "bg-gray-50"} min-h-screen`}>
      {/* Header Section - Not typically part of staggered animation, rendered directly */}
      <LabLeaderHeader leaderData={leaderData} />

      {/* Main Content Area with Animation Container */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sections Container */}
        <div className="flex flex-col space-y-8 md:space-y-12">
          {/* Render each section wrapped in motion.div for item animation */}
          <motion.div variants={itemVariants}>
            <ResearchInterestsSection
              interestsText={leaderData?.research_interests}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PublicationsSection
              publications={publications}
              fetchError={pubError}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AcademicServicesSection
              featuredServices={featuredServices}
              detailedServices={detailedServices}
              fetchError={dataError}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AwardsSection
              featuredAwards={featuredAwards}
              detailedAwards={detailedAwards}
              fetchError={dataError}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SponsorshipsSection
              featuredSponsorships={featuredSponsorships}
              detailedSponsorships={detailedSponsorships}
              // Pass fetchError if needed
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LabLeaderPageContent;
