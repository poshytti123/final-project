// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FlightBooking {

    address public owner;

    uint8 public constant DECIMALS = 2; 
    uint256 public constant SCALING_FACTOR = 10 ** uint256(DECIMALS);


    struct Flight {
        uint id;
        string fromAirport;
        string toAirport;
        uint departureTime;
        uint arrivalTime;
        uint availableTickets;
        uint256 pricePerTicket;
    }

    struct Booking {
        address user;
        uint flightId;
        uint ticketsCount;
    }

    uint public flightCount = 0;
    mapping(uint => Flight) public flights;
    mapping(address => Booking[]) public bookings;
    // mapping(address => uint256) public balances;

    event FlightAdded(uint indexed flightId, string fromAirport, string toAirport, uint departureTime, uint arrivalTime, uint availableTickets, uint256 pricePerTicket);
    event FlightBooked(address indexed user, uint indexed flightId, uint ticketsCount);
    event Deposit(address indexed user, uint amount);
    event Withdrawal(address indexed user, uint amount);

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    /**
     * @dev Adds a new flight to the system. Only callable by the contract owner.
     * @param _fromAirport The departure airport code.
     * @param _toAirport The arrival airport code.
     * @param _departureTime The departure timestamp.
     * @param _arrivalTime The arrival timestamp.
     * @param _availableTickets The number of available tickets.
     * @param _pricePerTicket Price per tickets.
     */
    function addFlight(
        string memory _fromAirport,
        string memory _toAirport,
        uint _departureTime,
        uint _arrivalTime,
        uint _availableTickets,
        uint256 _pricePerTicket
    ) public onlyOwner {
        flightCount++;
        flights[flightCount] = Flight(
            flightCount,
            _fromAirport,
            _toAirport,
            _departureTime,
            _arrivalTime,
            _availableTickets,
            _pricePerTicket
        );
        emit FlightAdded(flightCount, _fromAirport, _toAirport, _departureTime, _arrivalTime, _availableTickets, _pricePerTicket);
    }

    /**
     * @dev Retrieves flight details by flight ID.
     * @param _flightId The ID of the flight.
    
     */
    function getFlight(uint _flightId) public view returns (
        uint id,
        string memory fromAirport,
        string memory toAirport,
        uint departureTime,
        uint arrivalTime,
        uint availableTickets
    ) {
        Flight memory flight = flights[_flightId];
        require(flight.id != 0, "Flight does not exist.");
        return (
            flight.id,
            flight.fromAirport,
            flight.toAirport,
            flight.departureTime,
            flight.arrivalTime,
            flight.availableTickets
        );
    }

    /**
     * @dev Allows a user to book tickets for a flight.
     * @param _flightId The ID of the flight.
     * @param _ticketsCount The number of tickets to book.
     */
    function bookFlight(uint _flightId, uint _ticketsCount) public payable  {
        Flight storage flight = flights[_flightId];
        require(flight.id != 0, "Flight does not exist.");
        require(flight.availableTickets >= _ticketsCount, "Not enough tickets available.");

        // uint totalPrice = flight.pricePerTicket * _ticketsCount / SCALING_FACTOR;
        // require(balances[msg.sender] < totalPrice, "Client has insufficient balance.");

        uint256 totalPrice = flight.pricePerTicket * _ticketsCount;
        require(msg.value >= totalPrice, "Insufficient Ether sent.");


        flight.availableTickets -= _ticketsCount;
        // balances[msg.sender] -= totalPrice;
        bookings[msg.sender].push(Booking(msg.sender, _flightId, _ticketsCount));
        emit FlightBooked(msg.sender, _flightId, _ticketsCount);
        if (msg.value > totalPrice) {
            uint256 refundAmount = msg.value - totalPrice;
            payable(msg.sender).transfer(refundAmount);
        }
    }

    function getMyBookingCount() public view returns (uint) {
        return bookings[msg.sender].length;
    }

    function getMyBooking(uint index) public view 
        returns (uint flightId, string memory fromAirport, string memory toAirport, uint departureTime, uint arrivalTime,  uint ticketsCount) {
        require(index < bookings[msg.sender].length, "Index out of bounds");
        Booking storage booking = bookings[msg.sender][index];
        Flight storage flight = flights[booking.flightId];
        return (
                booking.flightId
                , flight.fromAirport
                , flight.toAirport
                , flight.departureTime 
                , flight.arrivalTime
                , booking.ticketsCount);
    }

    /**
     * @dev Retrieves all available flights.
     * @return An array of all flights.
     */
    function getAllFlights() public view returns (Flight[] memory) {
        Flight[] memory allFlights = new Flight[](flightCount);
        for (uint i = 1; i <= flightCount; i++) {
            allFlights[i - 1] = flights[i];
        }
        return allFlights;
    }

    /**
     * @dev Retrieves all flights between two airports within a time range that have available tickets.
     * @param _fromAirport The departure airport code.
     * @param _toAirport The arrival airport code.
     * @param _startTime The start of the departure time range (inclusive).
     * @param _endTime The end of the departure time range (inclusive).
     * @return An array of matching flights.
     */
    function getAvailableFlights(
        string memory _fromAirport,
        string memory _toAirport,
        uint _startTime,
        uint _endTime
    ) public view returns (Flight[] memory) {
        uint count = 0;

        // First pass: Count matching flights to determine array size
        for (uint i = 1; i <= flightCount; i++) {
            Flight storage flight = flights[i];
            if (
                compareStrings(flight.fromAirport, _fromAirport) &&
                compareStrings(flight.toAirport, _toAirport) &&
                flight.departureTime >= _startTime &&
                flight.departureTime <= _endTime &&
                flight.availableTickets > 0
            ) {
                count++;
            }
        }

        // Initialize array with the correct size
        Flight[] memory matchingFlights = new Flight[](count);
        uint index = 0;

        // Second pass: Populate the array with matching flights
        for (uint i = 1; i <= flightCount; i++) {
            Flight storage flight = flights[i];
            if (
                compareStrings(flight.fromAirport, _fromAirport) &&
                compareStrings(flight.toAirport, _toAirport) &&
                flight.departureTime >= _startTime &&
                flight.departureTime <= _endTime &&
                flight.availableTickets > 0
            ) {
                matchingFlights[index] = flight;
                index++;
            }
        }

        return matchingFlights;
    }

    /**
     * @dev Internal function to compare two strings.
     * @param _a First string.
     * @param _b Second string.
     * @return True if strings are equal, false otherwise.
     */
    function compareStrings(string memory _a, string memory _b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked(_a)) == keccak256(abi.encodePacked(_b)));
    }
}
