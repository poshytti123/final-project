"use client";

import Flights from "./_components/flights";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const Tickets: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  if (connectedAddress === undefined) return <div />;

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl font-bold">{connectedAddress}</span>
        </h1>
        <Flights connectedAddress={connectedAddress} />
      </div>
    </div>
  );
};

export default Tickets;
