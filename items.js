export const defaultItems = {
    // Rocket Component Collectibles (needed for boss fight)
    rocket_fuel: {
        id: "rocket_fuel",
        name: "Rocket Fuel Cell",
        description: "High-energy propellant essential for rocket launches. Contains liquid hydrogen and oxygen.",
        emoji: "⛽",
        stackable: true,
        value: 1000,
        isRocketPart: true
    },
    engine_component: {
        id: "engine_component",
        name: "Engine Component",
        description: "A crucial part of the rocket engine. Uses Newton's Third Law of Motion.",
        emoji: "⚙️",
        stackable: true,
        value: 1500,
        isRocketPart: true
    },
    heat_shield: {
        id: "heat_shield",
        name: "Heat Shield Tile",
        description: "Protects the rocket during atmospheric re-entry. Withstands temperatures over 3,000°F.",
        emoji: "🛡️",
        stackable: true,
        value: 800,
        isRocketPart: true
    },
    navigation_chip: {
        id: "navigation_chip",
        name: "Navigation Chip",
        description: "Advanced guidance system for precise orbital calculations and trajectory planning.",
        emoji: "📡",
        stackable: true,
        value: 1200,
        isRocketPart: true
    },
    oxygen_tank: {
        id: "oxygen_tank",
        name: "Oxygen Tank",
        description: "Life support oxygen for astronauts. Essential for survival in the vacuum of space.",
        emoji: "🫧",
        stackable: true,
        value: 900,
        isRocketPart: true
    },
    
    // Educational Power-ups
    knowledge_boost: {
        id: "knowledge_boost",
        name: "Knowledge Boost",
        description: "Increases learning efficiency. Remember: rockets work by expelling mass at high velocity!",
        emoji: "🧠",
        stackable: true,
        value: 200
    },
    speed_boost: {
        id: "speed_boost",
        name: "Thruster Boost",
        description: "Increases movement speed like a rocket's main thruster. Escape velocity is 25,020 mph!",
        emoji: "🚀",
        stackable: true,
        value: 150
    },
    
    // Collectibles
    moon_rock: {
        id: "moon_rock",
        name: "Moon Rock Sample",
        description: "A rare lunar sample. The Moon is 238,855 miles from Earth on average.",
        emoji: "🌑",
        stackable: false,
        value: 5000
    },
    astronaut_manual: {
        id: "astronaut_manual",
        name: "Astronaut Training Manual",
        description: "Contains essential knowledge about space travel and rocket science.",
        emoji: "📚",
        stackable: false,
        value: 3000
    },
    
    // Tools
    telescope: {
        id: "telescope",
        name: "Space Telescope",
        description: "Helps observe distant celestial objects. The Hubble can see 13.4 billion light-years away!",
        emoji: "🔭",
        stackable: false,
        value: 1000
    },
    star_chart: {
        id: "star_chart",
        name: "Star Navigation Chart",
        description: "Maps the constellations for celestial navigation. Used since ancient times!",
        emoji: "🗺️",
        stackable: false,
        value: 2000
    },
    trajectory_calculator: {
        id: "trajectory_calculator",
        name: "Trajectory Calculator",
        description: "Calculate rocket trajectories using orbital mechanics principles.",
        emoji: "📊",
        stackable: false,
        value: 300,
        isCalculator: true
    },
    
    // Special Boss Fight Items
    elon_key: {
        id: "elon_key",
        name: "SpaceX Access Key",
        description: "Grants access to the final boss battle with Elon Musk. Collect all rocket parts first!",
        emoji: "🔑",
        stackable: false,
        value: 10000,
        isBossKey: true
    }
};
