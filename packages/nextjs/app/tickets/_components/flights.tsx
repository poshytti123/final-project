"use client";

import Flight from "./flight";
import { useReadContract } from "wagmi";
import { useDeployedContractInfo, useTargetNetwork } from "~~/hooks/scaffold-eth";

const Flights = ({ connectedAddress }) => {
  console.log("get flights for", connectedAddress);
  const { data: deployedContract } = useDeployedContractInfo("FlightBooking");
  const { targetNetwork } = useTargetNetwork();
  const { data, error, isError, isPending } = useReadContract({
    chainId: targetNetwork.id,
    functionName: "getMyBookingCount",
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    account: connectedAddress,
    // args: [ connectedAddress, ]
  });
  if (isError)
    return (
      <div className="alert alert-error">
        <p> {error.message}</p>
      </div>
    );
  if (data === undefined || data === 0)
    return (
      <div className="alert alert-warn">
        <p>No tickets booked</p>
      </div>
    );
  const rows = [];
  for (let i = 0; i < BigInt(data); i++) {
    const booking = <Flight connectedAddress={connectedAddress} flightId={i} />;
    rows.push(booking);
  }
  console.log(data, error, isError, isPending);

  return (
    <table className="table table-zebra table-xl">
      <thead>
        <tr>
          <th> origin </th>
          <th> dest </th>
          <th> departure </th>
          <th> arrival </th>
          <th> booked tickets </th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

export default Flights;
