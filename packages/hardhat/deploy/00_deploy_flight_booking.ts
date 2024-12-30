import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { airportCodes } from "../../const";

function toSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

// function timestampToDate(contractTimestamp: bigint | number): Date {
//   if (typeof contractTimestamp === "bigint") {
//     return new Date(Number(contractTimestamp) * 1000);
//   } else {
//     return new Date(contractTimestamp * 1000);
//   }
// }

// function parseDateTime(dateTimeStr: string): number {
//   const date = new Date(dateTimeStr);
//   if (isNaN(date.getTime())) {
//       throw new Error(`Invalid date format: ${dateTimeStr}`);
//   }
//   return toSeconds(date);
// }

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("FlightBooking", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const yourContract = await hre.ethers.getContract<Contract>("FlightBooking", deployer);

  generateFlights(airportCodes, Date.now(), 365).map(
    async flight =>
      await yourContract.addFlight(
        flight.origin,
        flight.destination,
        toSeconds(flight.departureTime),
        toSeconds(flight.arrivalTime),
        flight.availableTickets,
        flight.pricePerTicket,
        { gasLimit: 30000000 },
      ),
  );
  // await yourContract.addFlight( "SVX", "IST", parseDateTime("2024-06-14 21:34"), parseDateTime("2024-06-14 22:34"), 10);
  // await yourContract.addFlight( "SVX", "IST", parseDateTime("2024-06-15 06:34"), parseDateTime("2024-06-15 22:34"), 10);
  // await yourContract.addFlight( "SVX", "IST", parseDateTime("2024-06-16 20:34"), parseDateTime("2024-06-16 22:34"), 10);
  console.log("🛩️ All availiable flights:");
  // (await yourContract.getAllFlights()).map(( ( { flight } ) => console.log("🛩️" , flight)));
  // console.log(await yourContract.getAllFlights());
  const results = await yourContract.getAllFlights();
  results
    .map((flight: any) => ({
      id: flight[0],
      origin: flight[1],
      destination: flight[2],
      departureTime: new Date(Number(flight[3]) * 1000), // Convert BigInt to ms for Date
      arrivalTime: new Date(Number(flight[4]) * 1000),
      seats: Number(flight[5]), // Convert BigInt to Number
    }))
    .map(console.log);
  // , flight.fromAirport
  // , flight.toAirport
  // , timestampToDate(flight.departureTime)
  // , timestampToDate(flight.arrivalTime)
  // , flight.availableTickets)));
};

type Flight = {
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  availableTickets: number;
  pricePerTicket: number;
};

function generateFlights(airports: string[], startDate: Date, numDays: number): Flight[] {
  const flights: Flight[] = [];

  for (let day = 0; day < numDays; day++) {
    const flightDate = new Date(startDate);
    flightDate.setDate(flightDate.getDate() + day);
    const numFlights = Math.floor(Math.random() * 5) + 1; // Random 1-5 flights per day

    for (let i = 0; i < numFlights; i++) {
      const origin = airports[Math.floor(Math.random() * airports.length)];
      const destination = airports.filter(a => a !== origin)[Math.floor(Math.random() * (airports.length - 1))];
      const departureTime = new Date(flightDate);
      departureTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      const flightDurationHours = Math.floor(Math.random() * 5) + 1; // 1-5 hours
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + flightDurationHours);
      const seats = Math.floor(Math.random() * 291) + 10; // 10-300 seats
      const price = Math.floor(Math.random() * 100); // 0.00-10.00 eth

      flights.push({
        origin,
        destination,
        departureTime,
        arrivalTime,
        availableTickets: seats,
        pricePerTicket: price,
      });
    }
  }

  return flights;
}

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["FlightBooking"];
