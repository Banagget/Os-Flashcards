import type { Chapter, Flashcard } from "./flashcards";

const chapterNames = [
  "Physical Quantities",
  "Kinematics",
  "Dynamics",
  "Turning Effects of Forces",
  "Pressure",
  "Energy",
  "Kinetic Particle Model",
  "Thermal Processes",
  "Thermal Properties",
  "Waves",
  "Electromagnetic Spectrum",
  "Light",
  "Static Electricity",
  "Current of Electricity",
  "DC Circuits",
  "Practical Electricity",
  "Magnetism",
  "Electromagnetism",
  "Electromagnetic Induction",
  "Radioactivity",
] as const;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const physicsKeywordChapters: Chapter[] = chapterNames.map((name) => ({
  name: `${name} Keywords`,
  slug: `physics-keywords-${slugify(name)}`,
  subject: "physicsKeywords",
}));

interface CardOptions {
  questionImage?: string;
  questionImageAlt?: string;
  examples?: Flashcard[];
}

const lines = (...content: string[]) => content.join("\n");

const makeCard = (
  chapterNumber: number,
  id: string,
  title: string,
  question: string,
  explanation: string,
  options: CardOptions = {},
): Flashcard => {
  const chapter = physicsKeywordChapters[chapterNumber - 1];
  return {
    id: `physics-keywords-c${String(chapterNumber).padStart(2, "0")}-${id}`,
    subject: "physicsKeywords",
    chapter: chapter.name,
    chapterSlug: chapter.slug,
    title,
    question,
    formula: "",
    explanation,
    questionTone: "red",
    ...options,
  };
};

const makeExample = (
  chapterNumber: number,
  id: string,
  title: string,
  question: string,
  explanation: string,
  options: Omit<CardOptions, "examples"> = {},
): Flashcard => ({
  ...makeCard(chapterNumber, `example-${id}`, title, question, explanation, options),
  questionTone: "green",
});

export const physicsKeywordFlashcards: Flashcard[] = [
  makeCard(
    1,
    "average-oscillation-time",
    "Average oscillation time",
    "Describe what measurements are taken and how they are used to find the average time for one complete oscillation accurately. [3 marks]",
    lines(
      "• Once the pendulum’s swing reaches a **steady state**, use a **stopwatch** to record the time taken for **20 complete oscillations t₁**.",
      "• Swing the pendulum again and record the time taken for **another 20 complete oscillations t₂**.",
      "• Calculate the **average time for 20 complete oscillations T20 = (t₁ + t₂) / 2**.",
      "• **(T20 / 20)** is the average time taken for **1 complete oscillation**.",
    ),
    {
      questionImage: "images/physics-keywords/physical-quantities-pendulum.png",
      questionImageAlt: "A pendulum suspended from a fixed support",
    },
  ),

  makeCard(
    2,
    "describe-motion-format",
    "Describe motion format",
    "Describe the motion of the object. [2 marks]",
    lines(
      "**Format:**",
      "1. Moving in the (**positive / negative**) direction",
      "2. with (**increasing / decreasing / constant**)",
      "3. (**gradient**)",
    ),
    {
      examples: [
        makeExample(
          2,
          "velocity-time-graph-1",
          "Velocity-time graph 1",
          "Describe the motion of the object.",
          lines(
            "• From 0 s to 10 s, moving with **constant acceleration**.",
            "• From 10 s to 20 s, moving with **decreasing acceleration**.",
            "• From 20 s to 45 s, moving with **constant velocity**.",
            "• From 45 s to 50 s, moving with **increasing deceleration**.",
            "• From 50 s to 60 s, moving with **constant deceleration**.",
          ),
          {
            questionImage: "images/physics-keywords/kinematics-example-1.png",
            questionImageAlt: "Velocity-time graph with changing gradients from 0 to 60 seconds",
          },
        ),
        makeExample(
          2,
          "velocity-time-graph-2",
          "Velocity-time graph 2",
          "Describe the motion of the object.",
          lines(
            "• From 0 s to 50 s, moving in the **positive direction** with **constant velocity**.",
            "• From 50 s to 70 s, moving in the **positive direction** with **constant deceleration**.",
            "• From 70 s to 80 s, **at rest**.",
            "• From 80 s to 90 s, moving in the **negative direction** with **constant acceleration**.",
            "• From 90 s to 110 s, moving in the **negative direction** with **constant deceleration**.",
          ),
          {
            questionImage: "images/physics-keywords/kinematics-example-2.png",
            questionImageAlt: "Velocity-time graph crossing from positive to negative velocity",
          },
        ),
      ],
    },
  ),

  makeCard(
    3,
    "explain-motion-format",
    "Explain motion format",
    "Explain the motion of the object. [2 marks]",
    lines("**Format:**", "1. **Each force**", "2. **Resultant force**", "3. **Acceleration**"),
    {
      examples: [
        makeExample(
          3,
          "constant-velocity-car",
          "Car at constant velocity",
          "Explain why the car moves with constant velocity.",
          lines(
            "• **Driving force is equal and opposite to the friction.**",
            "• **Resultant force on the car is zero.**",
            "• **Acceleration is zero.**",
          ),
          {
            questionImage: "images/physics-keywords/dynamics-car.png",
            questionImageAlt: "A car with friction and forward driving force acting in opposite directions",
          },
        ),
        makeExample(
          3,
          "terminal-velocity",
          "Terminal velocity",
          "Explain how the object reaches terminal velocity.",
          lines(
            "• As speed increases, **air resistance increases** until it is equal to the **weight**.",
            "• **Resultant force decreases until zero.**",
            "• **Acceleration decreases until zero.**",
          ),
        ),
      ],
    },
  ),
  makeCard(
    3,
    "newtons-third-law-format",
    "Newton’s Third Law format",
    "Explain using Newton’s Third Law. [1 mark]",
    lines("**Format:**", "1. A exerts a force on B", "2. By **Newton’s Third Law**, B exerts an **equal and opposite force on A**"),
    {
      examples: [
        makeExample(
          3,
          "rocket",
          "Rocket",
          "Explain why the rocket ejects hot gas downwards.",
          lines(
            "• **Rocket exerts a downward force on the gas.**",
            "• By **Newton’s Third Law**, **gas exerts an equal and opposite upward force on the rocket**.",
          ),
        ),
      ],
    },
  ),
  makeCard(
    3,
    "action-reaction-format",
    "Action-reaction pair format",
    "Describe the force that forms an action-reaction pair with A. [2 marks]",
    lines("**Format:**", "1. Force by **B on A**", "2. Which is **equal in magnitude and opposite in direction**"),
    {
      examples: [
        makeExample(
          3,
          "weight-of-man",
          "Weight of the man",
          "Describe the force that forms an action-reaction pair with the weight of the man.",
          lines("• The **upward force by man on Earth**", "• Which is **equal in magnitude and opposite in direction**."),
        ),
      ],
    },
  ),

  makeCard(
    4,
    "turning-effects-keywords",
    "Turning effects keywords",
    "Keywords",
    lines("1. **Force**", "2. **Perpendicular distance**", "3. **Moment**"),
    {
      examples: [
        makeExample(
          4,
          "force-a-larger",
          "Force A is larger",
          "Explain why force A is larger than B.",
          lines("• **Perpendicular distance** of A from pivot is smaller than B.", "• To exert the **same moment**, force A is larger."),
          {
            questionImage: "images/physics-keywords/turning-force-balance.png",
            questionImageAlt: "A balanced beam with forces A and B at different distances from the pivot",
          },
        ),
        makeExample(
          4,
          "toy-does-not-rotate",
          "Toy does not rotate",
          "Explain why the toy does not rotate.",
          lines(
            "• **Line of action of the force passes through the pivot.**",
            "• **Perpendicular distance** between force and pivot is zero.",
            "• **Moment** exerted by force is zero.",
          ),
          {
            questionImage: "images/physics-keywords/turning-toy.png",
            questionImageAlt: "A hanging toy with its weight acting through its pivot",
          },
        ),
        makeExample(
          4,
          "object-topples",
          "Object topples",
          "Explain why the object topples.",
          "• Line of action of the weight produces a **clockwise moment about the pivot**.",
          {
            questionImage: "images/physics-keywords/turning-topple.png",
            questionImageAlt: "A tilted object toppling about its point of contact",
          },
        ),
      ],
    },
  ),

  makeCard(
    5,
    "manometer-mercury",
    "Mercury manometer",
    "Explain what happens to the height difference in the manometer if mercury is used instead of water. [2 marks]",
    lines(
      "• Mercury has a **higher density** than water.",
      "• To exert the **same pressure**, mercury needs a **smaller height**.",
      "• Hence the **height difference decreases**.",
    ),
  ),
  makeCard(
    5,
    "hydraulic-press-force",
    "Hydraulic press force",
    "Explain why the force on the larger side of the hydraulic press is larger. [2 marks]",
    lines(
      "• The **same pressure** is transmitted throughout the liquid.",
      "• As the other piston has a **larger cross-sectional area**, it experiences a **larger force**.",
    ),
  ),
  makeCard(
    5,
    "hydraulic-system-air",
    "Air in a hydraulic system",
    "Explain why the hydraulic system does not work properly if it contains air. [1 mark]",
    lines(
      "• Air in the bubbles are **compressible**.",
      "• Some pressure is used to **compress the bubbles** and pressure is not fully **transmitted** to the other piston.",
    ),
  ),

  makeCard(
    6,
    "energy-transfer-format",
    "Energy transfer format",
    "Describe the energy transfers. [2 marks]",
    lines("**Format:**", "Energy is transferred (**method**) from (**store**) to (**store**)."),
    {
      examples: [
        makeExample(
          6,
          "ball-a-to-b",
          "Ball moving from A to B",
          "Describe the energy transfer as the ball moves from A to B.",
          "• Energy is transferred **mechanically** from the **gravitational potential store of the ball** to the **kinetic store of the ball**.",
          {
            questionImage: "images/physics-keywords/energy-ball.png",
            questionImageAlt: "A ball moving down a curved path from A to B",
          },
        ),
        makeExample(
          6,
          "wind-turbine",
          "Wind turbine",
          "Describe how energy transfer takes place in the wind turbine.",
          lines(
            "• Energy is transferred **mechanically** from the **kinetic store of the wind** to the **kinetic store of the turbine**.",
            "• Energy is then transferred **electrically**.",
          ),
          {
            questionImage: "images/physics-keywords/energy-wind-turbine.png",
            questionImageAlt: "Several wind turbines",
          },
        ),
      ],
    },
  ),

  makeCard(
    7,
    "pressure-change-format",
    "Gas pressure change format",
    "Explain why the pressure changes. [2 marks]",
    lines(
      "**Format:**",
      "1. **Context** of the question",
      "2. Change in **frequency** and/or change in **force** of collisions",
      "3. Change in **force per unit area** on walls hence change in **pressure**",
    ),
    {
      examples: [
        makeExample(
          7,
          "volume-increases",
          "Volume increases",
          "Explain what happens to the pressure of trapped air in the cylinder when the volume increases.",
          lines(
            "• **Number of particles per unit volume decreases.**",
            "• **Frequency of collisions with the container decreases.**",
            "• **Force per unit area** on walls of container decreases, **gas pressure decreases**.",
          ),
        ),
        makeExample(
          7,
          "cylinder-heated",
          "Cylinder is heated",
          "Explain what happens to the pressure of the trapped air when the cylinder is heated.",
          lines(
            "• **Energy in kinetic store of air molecules increases** and they move faster.",
            "• **Frequency and force of collisions** with the container increase.",
            "• **Force per unit area** on walls of container increases, **gas pressure increases**.",
          ),
        ),
      ],
    },
  ),
  makeCard(
    7,
    "molecules-exert-pressure",
    "How molecules exert pressure",
    "Explain how the air molecules exert a pressure. [2 marks]",
    lines(
      "• Air molecules are in **constant random motion** and **collide with the walls** of the container.",
      "• Exerting a **force per unit area** on the walls.",
    ),
  ),
  makeCard(
    7,
    "brownian-motion",
    "Brownian motion",
    "Explain Brownian motion. [2 marks]",
    lines(
      "• **Invisible air molecules are in constant random motion.**",
      "• They **collide with visible smoke particles randomly**.",
      "• Causing **smoke particles to move randomly**.",
    ),
  ),

  makeCard(
    8,
    "conduction",
    "Conduction",
    "Explain the process of conduction. [2 marks]",
    lines(
      "• Molecules in the hotter region **vibrate faster**.",
      "• And transfer energy through **collisions with neighbouring molecules**.",
      "",
      "For **metals**, include:",
      "• **Free electrons move and collide with particles**, transferring energy.",
    ),
  ),
  makeCard(
    8,
    "convection",
    "Convection",
    "Explain the process of convection. [2 marks]",
    lines(
      "• Liquid at the bottom gets heated / Liquid at the top gets cooled.",
      "• **Hotter, less dense liquid rises.**",
      "• **Cooler, more dense liquid sinks.**",
      "• This creates a **convection current**.",
    ),
  ),
  makeCard(8, "radiation", "Radiation", "Explain the process of radiation. [1 mark]", "• Energy is transferred via **emission of infrared radiation**."),
  makeCard(
    8,
    "black-dull-surface",
    "Black and dull surface",
    "Explain why a black and dull surface is used. [1 mark]",
    lines(
      "• The black and dull surface is a **good absorber / emitter of radiation**.",
      "• Hence **maximising heat gain / loss by radiation**.",
    ),
  ),
  makeCard(
    8,
    "white-shiny-surface",
    "White and shiny surface",
    "Explain why a white and shiny surface is used. [1 mark]",
    lines(
      "• The white and shiny surface is a **poor absorber / emitter of radiation**.",
      "• Hence **minimising heat gain / loss by radiation**.",
    ),
  ),
  makeCard(
    8,
    "air-layer-heat-loss",
    "Layer of air",
    "Explain why the layer of air reduces heat loss. [2 marks]",
    lines("• Air is a **poor conductor of heat**.", "• Hence **minimising heat loss by conduction**."),
  ),
  makeCard(
    8,
    "lid-heat-loss",
    "Lid",
    "Explain why the lid reduces heat loss. [2 marks]",
    lines("• The lid **minimises formation of convection currents**.", "• Hence **minimising heat loss by convection**."),
  ),

  makeCard(
    9,
    "temperature-change-of-state",
    "Temperature during change of state",
    "Explain why temperature does not change during change of state. [2 marks]",
    lines(
      "**Melting / Boiling**",
      "• Energy **absorbed** is used to **increase energy in internal potential store** by **overcoming intermolecular forces of attraction**.",
      "• Energy in **internal kinetic store does not change**.",
      "",
      "**Freezing / Condensation**",
      "• Energy **released** is from the **decrease in energy in internal potential store** by **forming intermolecular forces of attraction**.",
      "• Energy in **internal kinetic store does not change**.",
    ),
  ),
  makeCard(
    9,
    "internal-stores-heating",
    "Internal stores during heating",
    "Explain what happens to the internal stores of an object as it is heated up (without a change of state). [1 mark]",
    lines("• Energy in **internal kinetic store increases**.", "• Energy in **internal potential store is constant**."),
  ),
  makeCard(
    9,
    "evaporation-cooling",
    "Evaporation cooling",
    "Explain how evaporation cools an object. [2 marks]",
    lines(
      "• **More energetic** water molecules have enough energy to **overcome intermolecular forces and escape**.",
      "• The remaining molecules in the liquid have **lower average kinetic energy**, hence **temperature decreases**.",
    ),
  ),

  makeCard(
    10,
    "wave-type",
    "Type of wave",
    "State and explain the type of wave produced. [2 marks]",
    lines(
      "• The wave is **transverse / longitudinal**.",
      "• As particles vibrate **perpendicular / parallel to the direction of wave propagation**.",
    ),
  ),
  makeCard(
    10,
    "sound-transmission",
    "Sound transmission",
    "Explain how sound waves are transmitted. [2 marks]",
    lines(
      "• When an object vibrates, **nearby air particles get displaced**.",
      "• These air particles then **displace the neighbouring air particles**.",
      "• This sets up a series of **compressions and rarefactions** in the air.",
      "• The sound wave then travels in the form of **longitudinal waves**.",
    ),
  ),
  makeCard(
    10,
    "point-q-cycle",
    "Point Q movement",
    "Describe the movement of point Q for one complete cycle. [2 marks]",
    lines(
      "• Point Q **moves down to the lowest position**.",
      "• Then **moves up to the highest position**.",
      "• Then **moves back down to its original position**.",
    ),
    {
      questionImage: "images/physics-keywords/waves-point-q.png",
      questionImageAlt: "A transverse wave with point Q marked near a crest",
    },
  ),

  makeCard(11, "ionising-harm", "Ionising radiation", "Explain why ionising radiation is harmful. [1 mark]", "• It **ionises human cells**, causing **cell damage**."),
  makeCard(11, "non-ionising-harm", "Non-ionising radiation", "Explain why non-ionising radiation is harmful. [1 mark]", "• It has **heating effects**, causing **cell damage**."),

  makeCard(
    12,
    "total-internal-reflection",
    "Total internal reflection",
    "Explain the path taken by the light. [2 marks]",
    lines(
      "• Light travels from an **optically denser medium** to an **optically less dense medium**.",
      "• **Angle of incidence is greater than the critical angle.**",
      "• Hence **total internal reflection occurs**.",
    ),
    {
      questionImage: "images/physics-keywords/light-total-internal-reflection.png",
      questionImageAlt: "A light ray reflecting inside a denser medium",
    },
  ),
  makeCard(12, "real-or-virtual", "Real or virtual image", "Explain if the image is real or virtual. [1 mark]", "• The image is **real / virtual** as it **can / cannot be formed on a screen**."),

  makeCard(13, "positive-attraction", "Attraction to a positive object", "Explain why X is attracted to the positively charged object. [1 mark]", "• X is **negatively charged** and **unlike charges attract**."),
  makeCard(13, "positive-repulsion", "Repulsion from a positive object", "Explain why X is repelled by the positively charged object. [1 mark]", "• X is **positively charged** and **like charges repel**."),
  makeCard(
    13,
    "sphere-earthed",
    "Earthed sphere",
    "Explain what happens to the charge on the sphere when it is earthed. [2 marks]",
    lines(
      "**Format:**",
      "• Always talk about the **movement of electrons**.",
      "• When something is **positively / negatively charged**, mention it has **excess charges**.",
      "",
      "• Due to **charging by induction**,",
      "• **Electrons in the sphere get repelled** by the rod and **flow into the earth** as like charges repel.",
      "• Sphere is **positively charged** as it has **excess positive charges**.",
    ),
    {
      questionImage: "images/physics-keywords/static-earthing.png",
      questionImageAlt: "A charged rod beside a metal sphere connected to earth",
    },
  ),
  makeCard(
    13,
    "neutral-foil-attraction",
    "Neutral metal foil attraction",
    "Explain why the neutral metal foil gets attracted to the negatively charged rod. [3 marks]",
    lines(
      "• **Electrons in the foil get repelled to the further side** from the rod as like charges repel.",
      "• Forces of **attraction between closer side** of the foil and the rod due to unlike charges is **stronger than** forces of **repulsion between further side** of the foil and the rod due to like charges.",
      "• Resulting in **net attraction**.",
    ),
    {
      questionImage: "images/physics-keywords/static-neutral-foil.png",
      questionImageAlt: "A negatively charged rod polarising and attracting neutral metal foil",
    },
  ),
  makeCard(
    13,
    "charging-by-friction",
    "Charging by friction",
    "Describe how the plastic becomes negatively charged and the cloth becomes positively charged. [1 mark]",
    "• Due to **charging by friction**, **electrons get transferred from the cloth to the plastic**.",
  ),
  makeCard(13, "charge-build-up-danger", "Danger of charge build-up", "Explain why build up of excess charges is dangerous. [1 mark]", "• **Sudden discharge** can cause **sparks and explosions**."),
  makeCard(
    13,
    "electrostatic-precipitator",
    "Electrostatic precipitator",
    "Explain how an electrostatic precipitator removes dust from air. [2 marks]",
    lines(
      "• When moving past the negative rods, **dust particles get negatively charged**.",
      "• Dust particles get attracted to the **positively charged plates** as **unlike charges attract**.",
    ),
    {
      questionImage: "images/physics-keywords/static-precipitator.png",
      questionImageAlt: "An electrostatic precipitator with rods and collecting plates",
    },
  ),

  makeCard(
    14,
    "ohmic-resistor-graph",
    "Ohmic resistor graph",
    "Explain how the graph shows if the resistor is ohmic. [1 mark]",
    "• The resistor is ohmic as its I-V graph is a **straight line that passes through the origin**, hence **current is directly proportional to voltage**.",
    {
      questionImage: "images/physics-keywords/current-ohmic-graph.png",
      questionImageAlt: "A straight-line current-voltage graph passing through the origin",
    },
  ),

  makeCard(
    15,
    "ldr-thermistor-format",
    "LDR and thermistor format",
    "Format",
    lines(
      "1. Change in resistance of **LDR / Thermistor**.",
      "Then, depending on the question:",
      "2a. Change in **total resistance**.",
      "2b. As it takes up a **bigger proportion of the total resistance**, the **potential difference across it increases**.",
    ),
    {
      examples: [
        makeExample(
          15,
          "light-intensity-increases",
          "Light intensity increases",
          "The light intensity increases. State and explain the change to the (a) ammeter reading and (b) p.d. across the 12 kΩ resistor.",
          lines(
            "**(a) Ammeter reading**",
            "• As light intensity increases, **resistance of LDR decreases**.",
            "• **Total resistance of circuit decreases**.",
            "• **Current increases** hence ammeter reading increases.",
            "",
            "**(b) p.d. across the 12 kΩ resistor**",
            "• As light intensity increases, **resistance of LDR decreases**.",
            "• **Total resistance across XY decreases**.",
            "• XY takes up a **smaller proportion of total resistance**, hence **potential difference across XY decreases**.",
            "• **Potential difference across 12 kΩ resistor decreases**.",
          ),
          {
            questionImage: "images/physics-keywords/dc-circuits-example.png",
            questionImageAlt: "A circuit containing an LDR, fixed resistors and an ammeter",
          },
        ),
      ],
    },
  ),

  makeCard(
    16,
    "earth-wire",
    "Earth wire",
    "Explain the purpose of the earth wire. [2 marks]",
    lines(
      "• If the **metal casing becomes live**, the earth wire provides a **path of low resistance**.",
      "• Protecting the user from **electric shock**.",
    ),
  ),
  makeCard(
    16,
    "fuse",
    "Fuse",
    "Explain the purpose of the fuse. [1 mark]",
    lines("• When current **exceeds a certain level**, fuse **melts and opens circuit**.", "• Keeping current at a **safe level**."),
  ),
  makeCard(
    16,
    "fuse-live-wire",
    "Fuse in live wire",
    "Explain why the fuse must be connected to the live wire. [2 marks]",
    lines(
      "• When current **exceeds a certain level**, fuse **melts and opens the circuit**.",
      "• **Disconnecting appliance from the high voltage**, protecting user from **electric shock**.",
    ),
  ),
  makeCard(
    16,
    "double-insulation",
    "Double insulation",
    "Explain the purpose of double insulation. [2 marks]",
    lines(
      "• Both the **casing and cables are insulated from the internal components**.",
      "• Preventing **direct contact between user and bare wires**.",
    ),
  ),

  makeCard(
    17,
    "iron-attracted",
    "Iron attracted by a magnet",
    "Explain why iron is attracted by the magnet. [2 marks]",
    lines("• The **closer side** of the iron becomes an **induced north / south pole**.", "• As **unlike poles attract**, iron gets attracted."),
  ),
  makeCard(
    17,
    "iron-steel-properties",
    "Iron and steel",
    "Explain the different magnetic properties of iron and steel. [2 marks]",
    lines("• Iron is **easily magnetised** and **loses magnetism easily**.", "• Steel is **harder to magnetise** and **retains magnetism**."),
  ),
  makeCard(
    17,
    "demagnetise",
    "Demagnetising a magnet",
    "Explain how to demagnetise a magnet. [2 marks]",
    lines("• Place a magnet inside a **solenoid connected to an alternating current**.", "• **Withdraw the magnet slowly** from the solenoid."),
  ),

  makeCard(
    18,
    "wire-motion",
    "Motion of a current-carrying wire",
    "Explain the motion of the wire. [2 marks]",
    lines(
      "• **Magnetic field of the current interacts with the magnetic field of the magnet to produce a force.**",
      "• By **Fleming’s Left Hand Rule**, since **current is into the paper** and **magnetic field is to the right**, the **force is downwards**.",
    ),
    {
      questionImage: "images/physics-keywords/electromagnetism-wire.png",
      questionImageAlt: "A current directed into the page in a magnetic field pointing right",
    },
  ),
  makeCard(
    18,
    "dc-motor",
    "DC motor",
    "Explain why the DC motor turns. [2 marks]",
    lines(
      "• **Magnetic field of current interacts with the external magnetic field to produce a force.**",
      "• By **Fleming’s Left Hand Rule**, a **downward force acts on the left side of the coil** and an **upward force acts on the right side of the coil**.",
      "• Causing the coil to rotate in an **anticlockwise direction**.",
    ),
    {
      questionImage: "images/physics-keywords/electromagnetism-motor.png",
      questionImageAlt: "A DC motor coil between north and south magnetic poles",
    },
  ),
  makeCard(
    18,
    "split-ring-commutator",
    "Split ring commutator",
    "Explain the purpose of the split ring commutator. [2 marks]",
    lines(
      "• It **reverses the direction of current every half rotation**.",
      "• By **Fleming’s Left Hand Rule**, the **direction of force on each side of the coil also reverses every half rotation**.",
      "• This allows the coil to **continue rotating in the same direction**.",
    ),
  ),

  makeCard(
    19,
    "faradays-law-current",
    "Faraday’s Law current",
    "Explain why there is a current flowing through the coil. [2 marks]",
    lines(
      "• By **Faraday’s Law**, as there is a **change in magnetic flux linkage** of the coil, an **emf is induced**.",
      "• As it is a **closed circuit**, current flows through the coil.",
    ),
    {
      questionImage: "images/physics-keywords/induction-faraday.png",
      questionImageAlt: "A bar magnet moving towards a coil in a closed circuit",
    },
  ),
  makeCard(
    19,
    "slip-rings",
    "Slip rings",
    "Explain the purpose of the slip rings. [1 mark]",
    lines("• Slip rings are in **continuous contact** with the coil and carbon brushes.", "• Ensuring **current can flow continuously**."),
  ),
  makeCard(
    19,
    "transformer",
    "Transformer",
    "Explain how a transformer works. [2 marks]",
    lines(
      "• **Alternating current in primary coil** generates a **changing magnetic field**.",
      "• **Changing magnetic flux linkage in secondary coil** causes induced emf in secondary coil.",
    ),
  ),
  makeCard(
    19,
    "high-voltage-transmission",
    "High-voltage transmission",
    "Explain why power is transmitted at a high voltage. [2 marks]",
    lines(
      "• For the **same power transmitted**.",
      "• Stepping up the voltage **lowers the transmission current**.",
      "• This **reduces power loss** in transmission cables.",
    ),
  ),
  makeCard(19, "soft-iron-core", "Soft iron core", "Explain the purpose of a soft iron core. [1 mark]", "• **Concentrates the magnetic field** to increase the **magnetic flux linkage**."),
  makeCard(19, "laminated-core", "Laminated iron core", "Explain why the iron core is laminated. [1 mark]", "• **Reduces eddy currents** so as to **reduce energy loss**."),
  makeCard(19, "transformer-efficiency", "Transformer efficiency", "Explain why a transformer is not 100% efficient. [1 mark]", "• There is some **energy lost due to eddy currents**."),
  makeCard(
    19,
    "lenzs-law-format",
    "Lenz’s Law format",
    "Explain using Lenz’s Law.",
    lines(
      "**Format:**",
      "1. **By Lenz’s Law, direction of induced current produces a magnetic field so as to oppose the change in magnetic flux linkage.**",
      "2. Explain direction of induced current according to the context of the question.",
    ),
    {
      examples: [
        makeExample(
          19,
          "lenz-switch-closed",
          "Switch S is closed",
          "Explain the direction of induced current flowing through device X when switch S is just closed.",
          lines(
            "• **By Lenz’s Law, direction of induced current will produce a magnetic field so as to oppose the change in magnetic flux linkage.**",
            "• Hence induced current will **flow to the right of device X** so as to produce a **South pole to the left of coil Q**.",
          ),
          {
            questionImage: "images/physics-keywords/induction-lenz-switch.png",
            questionImageAlt: "Two adjacent coils, one with switch S and one with device X",
          },
        ),
        makeExample(
          19,
          "lenz-alternating-current",
          "Alternating induced current",
          "Explain why the direction of induced current is alternating when the magnet rotates.",
          lines(
            "• **By Lenz’s Law, direction of induced current will produce a magnetic field so as to oppose the change in magnetic flux.**",
            "• As the **poles of the magnet approach and move away from the coil**, the **direction of induced current will continuously reverse** so as to **repel and attract the magnet respectively**.",
          ),
          {
            questionImage: "images/physics-keywords/induction-lenz-generator.png",
            questionImageAlt: "A rotating bar magnet above a coil",
          },
        ),
      ],
    },
  ),

  makeCard(
    20,
    "alpha-emission",
    "Alpha emission",
    "State how a nucleus changes when it emits an alpha particle. [2 marks]",
    lines("• **Number of protons decreases by two.**", "• **Number of neutrons decreases by two.**"),
  ),
  makeCard(
    20,
    "medical-short-half-life",
    "Short half-life in medicine",
    "Explain why radioactive particles used in medical treatments should have a short half-life. [1 mark]",
    "• This ensures the **amount remaining in the body is low after a few days**, reducing harm.",
  ),
  makeCard(20, "radiation-harm", "Harm from radiation", "Explain why alpha / beta / gamma is harmful to humans. [1 mark]", "• It is **highly ionising** which can cause **cell damage**."),
  makeCard(
    20,
    "smoke-detector",
    "Smoke detector",
    "Describe how a smoke detector works. [2 marks]",
    lines(
      "• When there is **no smoke**, alpha particles provide an **ionising current**.",
      "• When there is **smoke**, **smoke absorbs alpha particles** and ionising current is disrupted.",
    ),
  ),
  makeCard(
    20,
    "metal-thickness",
    "Monitoring metal thickness",
    "Explain how beta particles are used to monitor thickness of the metal sheet. [2 marks]",
    lines(
      "• Beta particles are **partially absorbed** by the metal sheet.",
      "• If the thickness is too high, **more particles get absorbed** and count rate **decreases**.",
      "• If the thickness is too low, **less particles get absorbed** and count rate **increases**.",
    ),
  ),
  makeCard(
    20,
    "fission-fusion",
    "Nuclear fission and fusion",
    "Explain the difference between nuclear fission and nuclear fusion. [2 marks]",
    lines("• Nuclear fission is where **an atom splits into two smaller nuclei**.", "• Nuclear fusion is where **two nuclei combine to form a heavier nucleus**."),
  ),
  makeCard(
    20,
    "reduce-exposure",
    "Reducing radiation exposure",
    "Describe 2 ways to reduce exposure to radioactive emissions. [2 marks]",
    lines("• Wear **lead-lined clothing and gloves**.", "• **Keep a distance away** by using tongs."),
  ),
  makeCard(
    20,
    "background-radiation",
    "Background radiation sources",
    "State 2 sources of background radiation. [2 marks]",
    lines("• **Cosmic rays.**", "• **Nuclear waste from power stations.**"),
  ),
];
