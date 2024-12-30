// components/FlightSearchForm.js
import { useState } from "react";
import { airportCodes } from "../../const";
import FlightSearchResult from "./FlightSearchResult";

const FlightSearchForm = () => {
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [ticketCount, setTicketCount] = useState(1);

  const results = !fromAirport ? (
    <div className="alert alert-info">
      {" "}
      <p>Pick departure airport</p>{" "}
    </div>
  ) : !toAirport ? (
    <div className="alert alert-info">
      {" "}
      <p>Pick destination airport</p>{" "}
    </div>
  ) : !flightDate ? (
    <div className="alert alert-info">
      {" "}
      <p>Pick date</p>{" "}
    </div>
  ) : ticketCount < 1 ? (
    <div className="alert alert-info">
      {" "}
      <p> Select ticket count</p>{" "}
    </div>
  ) : (
    <FlightSearchResult
      fromAirport={fromAirport}
      toAirport={toAirport}
      flightDate={flightDate}
      ticketCount={ticketCount}
    />
  );

  return (
    <div>
      <div className="p-4 bg-base-200 rounded-lg join join-horizontal">
        <select
          className="select select-bordered join-item"
          value={fromAirport}
          onChange={e => setFromAirport(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Departure Airport
          </option>
          {airportCodes.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered join-item"
          value={toAirport}
          onChange={e => setToAirport(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Arrival Airport
          </option>
          {airportCodes.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="input input-bordered join-item"
          value={flightDate}
          onChange={e => setFlightDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Ticket count"
          className="input input-bordered join-item"
          value={ticketCount}
          onChange={e => setTicketCount(e.target.value)}
          required
        />
      </div>
      {results}
    </div>
  );
};

export default FlightSearchForm;
