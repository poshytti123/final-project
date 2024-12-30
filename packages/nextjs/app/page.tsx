"use client";

import type { NextPage } from "next";
// import { useAccount } from "wagmi";
import FlightSearchForm from "~~/components/FlightSearchForm";

// import { useState } from "react";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl mb-2">Aviacoin</span>
            <span className="block text-2xl font-bold">Buy plane tickets with ethernum</span>
          </h1>
          <FlightSearchForm />
        </div>
      </div>
    </>
  );
};

export default Home;
