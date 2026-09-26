export const INITIAL_PROJECTS = [
  {
    id: "proj-hexapod-01",
    title: "Autonomous Hexapod Robotics Platform",
    subtitle: "6-Legged Rough-Terrain Navigating Robot with ROS2 & SLAM",
    category: "Robotics & AI",
    tags: ["ROS2", "C++", "SolidWorks", "STM32", "LiDAR", "PCB Design"],
    status: "Completed",
    date: "2026-08-15",
    timeframe: "June 2025 to August 2026",
    featured: true,
    coverImage: "/demo-assets/robotics.png",
    galleryImages: [
      "/demo-assets/robotics.png",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    summary: "Designed and engineered an 18-DOF autonomous hexapod robot using custom inverse kinematics, custom 4-layer motor driver PCBs, and onboard ROS2 spatial mapping.",
    description: `### Project Architecture & Design Highlights
This platform was built from the ground up to explore legged locomotion in unstructured environments where wheeled robotics fail.

- **CAD & Simulation:** Designed 18 custom leg joint mounts in SolidWorks optimized using Ansys stress analysis.
- **Hardware & Firmware:** Designed a custom 4-layer PCB with high-current copper fills (60A burst) and programmed FreeRTOS firmware on STM32H7.
- **Autonomous SLAM:** Integrated NVIDIA Jetson Orin Nano with RPLiDAR to achieve real-time RTAB-Map SLAM navigation.`,
    links: {
      paper: "https://arxiv.org",
      demo: "https://youtube.com"
    },
    bom: [
      { item: "STM32H743 MCU Custom Board", qty: "1", cost: "$45.00" },
      { item: "High Torque Digital Servos 35kg/cm", qty: "18", cost: "$540.00" },
      { item: "NVIDIA Jetson Orin Nano 8GB", qty: "1", cost: "$499.00" },
      { item: "RPLiDAR A2M8 360 Laser Scanner", qty: "1", cost: "$320.00" }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-fpv-drone-02",
    title: "High-Speed Carbon Fiber Racing Quadcopter",
    subtitle: "Custom Aerobatic Drone with Telemetry Overlay & Tele-operation",
    category: "Aerospace",
    tags: ["Carbon Fiber", "Betaflight", "C++", "Aerodynamics", "PCB", "Telemetry"],
    status: "Completed",
    date: "2026-06-20",
    timeframe: "November 2025 to June 2026",
    featured: true,
    coverImage: "/demo-assets/drone.png",
    galleryImages: [
      "/demo-assets/drone.png",
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    summary: "Built a 5-inch aerobatic quadcopter featuring custom 3mm carbon fiber frame arms, low-latency flight controller tuning, and live telemetry overlay.",
    description: `### Development Overview & Flight Dynamics
Developed focusing on high power-to-weight ratio and ultra-low latency control systems for high speed precision flight.

- Structural CAD modeling & CNC milling 3K twill carbon fiber frame plates.
- Soldering custom 60A 4-in-1 ESC stack and telemetry sensors.
- Closed-loop PID tuning logging 4,000 samples/sec to onboard flash storage.`,
    links: {
      paper: "",
      demo: "https://youtube.com"
    },
    bom: [
      { item: "Custom Carbon Fiber Frame Plates", qty: "1 Set", cost: "$65.00" },
      { item: "Brushless Motors 2306 2450KV", qty: "4", cost: "$96.00" },
      { item: "4-in-1 60A ESC Stack", qty: "1", cost: "$85.00" },
      { item: "HD FPV Digital Transmitter Unit", qty: "1", cost: "$220.00" }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-smart-workbench-03",
    title: "Modular IoT Oscilloscope & Signal Analyzer",
    subtitle: "Portable Dual-Channel Signal Visualizer with TFT Display & Wi-Fi",
    category: "Embedded & Circuits",
    tags: ["Embedded C", "ESP32-S3", "KiCad", "OLED/TFT", "Analog Design", "DSP"],
    status: "Completed",
    date: "2026-03-10",
    timeframe: "March 2025 to March 2026",
    featured: false,
    coverImage: "/demo-assets/embedded.png",
    galleryImages: [
      "/demo-assets/embedded.png",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    summary: "Created a handheld oscilloscope instrument with custom analog front-end conditioning circuits, dual 5 MSPS ADC sampling, and wireless web interface.",
    description: `### Development Breakdown
A hardware R&D project packing a benchtop oscilloscope into a portable aluminum body.

- KiCad schematic design of high-impedance Op-Amp front-end stage.
- Writing bare-metal C drivers for 10 MS/s ADC hardware DMA streaming on ESP32-S3.
- Machining aluminum body case and calibrating signal accuracy against Agilent bench scopes.`,
    links: {
      paper: "",
      demo: ""
    },
    bom: [
      { item: "ESP32-S3-WROOM MCU Module", qty: "1", cost: "$4.50" },
      { item: "High Speed ADC AD9280", qty: "2", cost: "$12.00" },
      { item: "3.5 inch SPI IPS Display", qty: "1", cost: "$18.00" },
      { item: "CNC Machined Aluminum Case", qty: "1", cost: "$40.00" }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "proj-arm-robotics-04",
    title: "6-Axis Precision Robotic Arm & Haptic Controller",
    subtitle: "Closed-Loop Servo Controller & Inverse Kinematics Tele-operation",
    category: "Robotics & AI",
    tags: ["ROS2", "C++", "SolidWorks", "CAN Bus", "Kinematics", "In Progress"],
    status: "In Progress",
    date: "",
    timeframe: "March 2026 to Present",
    featured: false,
    coverImage: "/demo-assets/robotics.png",
    galleryImages: [
      "/demo-assets/robotics.png"
    ],
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    summary: "Developing a 6-axis articulated robotic arm featuring zero-backlash cycloidal reducers, closed-loop CAN bus servo drivers, and haptic glove control.",
    description: `### Active R&D Project
Currently under active development focusing on custom cycloidal gearboxes 3D printed with Onyx carbon fiber and driven via CAN bus protocol.

- Completed 3D CAD modeling of custom NEMA 17 cycloidal speed reducers (30:1 ratio).
- Flashed custom STM32 microsecond CAN bus driver firmware and tested 1000Hz joint telemetry.`,
    links: {
      paper: "",
      demo: ""
    },
    bom: [
      { item: "NEMA 17 Stepper Motors", qty: "6", cost: "$90.00" },
      { item: "CAN Bus Encoder Drivers", qty: "6", cost: "$120.00" }
    ],
    updatedAt: new Date().toISOString()
  }
];
