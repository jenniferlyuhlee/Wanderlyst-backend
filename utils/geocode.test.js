"use strict";

const { getCoords, updatePlacesWithCoords } = require("./geocode");

// mock getCoords function
jest.mock("./geocode", () => ({
    // Import the actual implementation of the module
    ...jest.requireActual("./geocode"), 
    // mock only getCoords
    getCoords: jest.fn(),   
}));


const places = [
    {
        name:"testPlace",
        address: "Av. Gustave Eiffel, 75007",
        seq: 1,
        description: "test description",
        image: null
    }
]
describe("updatePlacesWithCoords", () => {
    test("returns array with updated place obj data", async () => {
        // // Mock getCoords to reutrn hardcoded lat/lng instead of api call
        // getCoords.mockResolvedValue({
        //       lat: 1,  // Mocked latitude
        //       lng: 1,  // Mocked longitude
        // });

        // const result = await updatePlacesWithCoords(places);
        // expect(result).toEqual([
        //     {
        //         name:"testPlace",
        //         address: "Av. Gustave Eiffel, 75007",
        //         seq: 1,
        //         description: "test description",
        //         image: null,
        //         lat: 1, 
        //         lng: 1
        //     }
        // ]);
    })
});