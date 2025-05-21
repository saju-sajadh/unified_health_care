"use client";

import React, { useState, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { IoPeopleSharp } from "react-icons/io5";
import { FaDatabase } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { useUser } from "@clerk/nextjs";
import { LoadingOutlined } from "@ant-design/icons";
import { getUser } from "@/actions/actions";
import { Roles } from "@/types/global";
import DashboardContent from "./(components)/dashboard";
import PatientsRegistrationContent from "./(components)/registration";
import RecordsContent from "./(components)/records";
import ProfileContent from "./(components)/hospitalProfile";
import SettingsContent from "./(components)/hospitalSettings";

interface UserData {
  userId: string;
  email: string;
  createdAt: Date;
  role: Roles;
  name?: string;
  hospitalCode?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  departments?: string[];
  licenseNumber?: string;
  establishedDate?: Date;
}

const HospitalDashboard = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [loggedUser, setLoggedUser] = useState<UserData | undefined | null>(
    null
  );
  const [activeMenu, setActiveMenu] = useState("Dashboard"); // Track active menu

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;
    async function getTheUser() {
      try {
        const Tempuser = await getUser(user?.id, "hospital");
        setLoggedUser(Tempuser.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getTheUser();
  }, [isLoaded, user]);

  const menus = [
    {
      name: "Dashboard",
      icon: MdOutlineDashboard,
    },
    {
      name: "Patients Registration",
      icon: IoPeopleSharp,
    },
    { name: "Records", icon: FaDatabase },
    {
      name: "Hospital Profile",
      icon: CgProfile,
      margin: true,
    },
    {
      name: "settings",
      icon: RiSettings4Line,
    },
  ];

  const [open, setOpen] = useState(false);

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return <DashboardContent setActive={setActiveMenu} />;
      case "Patients Registration":
        return <PatientsRegistrationContent />;
      case "Records":
        return <RecordsContent />;
      case "Hospital Profile":
        return <ProfileContent />;
      case "settings":
        return <SettingsContent setActive={setActiveMenu} />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome</h2>
            <p>Select an option from the sidebar to view content.</p>
          </div>
        );
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <LoadingOutlined className="!text-emerald-600 text-4xl lg:text-7xl" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div
        className={`bg-emerald-600 min-h-screen ${
          open ? "w-72" : "w-16"
        } duration-500 text-gray-100 px-4`}
      >
        <div className="py-3 flex justify-end">
          <HiMenuAlt3
            size={26}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 relative">
          {menus?.map((menu, i) => (
            <button
              key={i}
              onClick={() => setActiveMenu(menu.name)}
              className={` ${
                menu?.margin && "mt-5"
              } group flex items-center text-sm gap-3.5 font-medium p-2 rounded-md ${
                activeMenu === menu.name ? "bg-lime-900" : "hover:bg-lime-900"
              }`}
            >
              <div>{React.createElement(menu?.icon, { size: "20" })}</div>
              <h2
                style={{
                  transitionDelay: `${i + 3}00ms`,
                }}
                className={`whitespace-pre duration-500 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                {menu?.name}
              </h2>
              <h2
                className={`${
                  open && "hidden"
                } absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit`}
              >
                {menu?.name}
              </h2>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 m-3">{renderContent()}</div>
    </div>
  );
};

export default HospitalDashboard;
