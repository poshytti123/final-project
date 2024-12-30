"use client";

import { useReadContract } from "wagmi";
import { useDeployedContractInfo, useTargetNetwork } from "~~/hooks/scaffold-eth";

function timestampToDate(contractTimestamp: bigint | number): Date {
  if (typeof contractTimestamp === "bigint") {
    return new Date(Number(contractTimestamp) * 1000);
  } else {
    return new Date(contractTimestamp * 1000);
  }
}

const Flight = ({ connectedAddress, flightId }) => {
  console.log("get flight for", connectedAddress, flightId);
  const { data: deployedContract } = useDeployedContractInfo("FlightBooking");
  const { targetNetwork } = useTargetNetwork();
  const { data, error, isError, isPending } = useReadContract({
    chainId: targetNetwork.id,
    functionName: "getMyBooking",
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    account: connectedAddress,
    args: [flightId],
  });
  if (isError) {
    return (
      <tr className="alert alert-error">
        <td> {error.message}</td>
      </tr>
    );
  }
  if (data === undefined) {
    return (
      <tr className="alert alert-warn">
        <td>No tickets found</td>
      </tr>
    );
  }
  console.log(data, error, isError, isPending);
  const r = (
    <tr key={data[0].toString()}>
      <td> {data[1]} </td>
      <td> {data[2]} </td>
      <td> {timestampToDate(data[3]).toLocaleString()} </td>
      <td> {timestampToDate(data[4]).toLocaleString()} </td>
      <td> {data[5].toString()} </td>
    </tr>
  );
  return r;
};

export default Flight;
