// components/FlightSearchForm.js
import BookButton from "./BookButton";
import { useReadContract } from "wagmi";
import { useDeployedContractInfo, useTargetNetwork } from "~~/hooks/scaffold-eth";

function getTimeRangeFromDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const startTime = Math.floor(Date.UTC(year, month - 1, day) / 1000);
  const endTime = startTime + 86400 - 1;
  return { startTime, endTime };
}

function timestampToDate(contractTimestamp: bigint | number): Date {
  if (typeof contractTimestamp === "bigint") {
    return new Date(Number(contractTimestamp) * 1000);
  } else {
    return new Date(contractTimestamp * 1000);
  }
}

const FlightSearchForm = ({ fromAirport, toAirport, flightDate, ticketCount }) => {
  const { startTime, endTime } = getTimeRangeFromDate(flightDate);
  console.warn(fromAirport, toAirport, startTime, endTime);

  const { data: deployedContract } = useDeployedContractInfo("FlightBooking");
  const { targetNetwork } = useTargetNetwork();

  console.log(targetNetwork, deployedContract);
  const { data, error, isError, isPending } = useReadContract({
    chainId: targetNetwork.id,
    functionName: "getAvailableFlights",
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    args: [fromAirport, toAirport, startTime, endTime],
  });

  console.info(data);
  if (isPending)
    return (
      <div className="alert alert-info">
        <p>LOADING....</p>{" "}
      </div>
    );
  if (isError) return <div className="alert alert-error">{error.message}</div>;
  if (data == undefined || data.length == 0)
    return (
      <div className="alert alert-warning">
        <p>No flights, try another date</p>{" "}
      </div>
    );
  console.log(data);
  const f = data.map(flight => (
    <tr key={flight.id}>
      <td> {flight.fromAirport} </td>
      <td> {flight.toAirport} </td>
      <td> {timestampToDate(flight.departureTime).toLocaleString()} </td>
      <td> {timestampToDate(flight.arrivalTime).toLocaleString()} </td>
      <td> {flight.availableTickets !== undefined ? flight.availableTickets.toString() : "No tickets"} </td>
      <td> {(Number(flight.pricePerTicket) / 100.0).toString()} ETH </td>
      <td>
        {" "}
        {flight.availableTickets >= ticketCount ? (
          <BookButton flight={flight} ticketCount={ticketCount} />
        ) : (
          <div />
        )}{" "}
      </td>
    </tr>
  ));
  return (
    <table className="table table-zebra table-xl">
      <thead>
        <tr>
          <th> origin </th>
          <th> dest </th>
          <th> departure </th>
          <th> arrival </th>
          <th> available tickets </th>
          <th> price </th>
          <th> </th>
        </tr>
      </thead>
      <tbody>{f}</tbody>
    </table>
  );
};

export default FlightSearchForm;
