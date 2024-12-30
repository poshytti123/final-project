// components/BookButton.js
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

// function getTimeRangeFromDate(dateString: string) {
//   const [year, month, day] = dateString.split('-').map(Number);
//   const startTime = Math.floor(Date.UTC(year, month - 1, day) / 1000);
//   const endTime = startTime + 86400 - 1;
//   return { startTime, endTime };
// }

// function timestampToDate(contractTimestamp: bigint | number): Date {
//   if (typeof contractTimestamp === "bigint") {
//     return new Date(Number(contractTimestamp) * 1000);
//   } else {
//     return new Date(contractTimestamp * 1000);
//   }
// }

const BookButton = ({ flight, ticketCount }) => {
  const { data: deployedContract } = useDeployedContractInfo("FlightBooking");
  // const { targetNetwork } = useTargetNetwork();

  const { data, writeContractAsync } = useWriteContract();

  const totalPrice = Number(ticketCount) * (Number(flight.pricePerTicket) / 100.0);

  console.log(totalPrice);

  console.info(data);
  const handleClick = async () => {
    console.log("book flight", flight.id);
    const r = await writeContractAsync({
      functionName: "bookFlight",
      address: deployedContract?.address,
      abi: deployedContract?.abi,
      args: [flight.id, ticketCount],
      value: parseEther(totalPrice.toString()),
    });
    console.log(r);
  };
  return (
    <button onClick={handleClick} className="btn btn-accent">
      Book
    </button>
  );
};

export default BookButton;
