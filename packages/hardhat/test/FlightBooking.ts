import { expect } from "chai";
import { ethers } from "hardhat";
import { FlightBooking } from "../typechain-types";
import { generateFlights, toSeconds }  from "../deploy/00_deploy_flight_booking"
import { airportCodes } from "../../const";

describe("FlightBooking", function () {
  // We define a fixture to reuse the same setup in every test.

  let flightBooking: FlightBooking;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const flightBookingFactory = await ethers.getContractFactory("FlightBooking");
    flightBooking = (await flightBookingFactory.deploy(owner.address)) as FlightBooking;
    await flightBooking.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have some flights", async function () {
      

      const newflights = generateFlights(airportCodes, new Date(), 365);
      await Promise.all(newflights.map(
        flight =>
          flightBooking.addFlight(
            flight.origin,
            flight.destination,
            toSeconds(flight.departureTime),
            toSeconds(flight.arrivalTime),
            flight.availableTickets,
            flight.pricePerTicket,
            { gasLimit: 30000000 },
          ),
      ));

      expect(await flightBooking.getAllFlights()).to.be.not.empty;
    });

    // it("Should allow setting a new message", async function () {
    //   const newGreeting = "Learn Scaffold-ETH 2! :)";

    //   await flightBooking.setGreeting(newGreeting);
    //   expect(await flightBooking.greeting()).to.equal(newGreeting);
    // });
  });
});
