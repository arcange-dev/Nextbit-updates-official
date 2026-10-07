const make=(id,title,group,description)=>({id,title,group,description,stages:[
"Foundations and core concepts",
"Languages, tools and platforms",
"Core systems and implementation",
"Production architecture and security",
"Operations, testing and observability",
"Advanced systems, research and leadership"
]});
export const ROADMAPS=[
make("software-engineering","Software Engineering","Software","Programming, architecture, testing, APIs, distributed systems and engineering leadership."),
make("web-development","Web Development","Software","Modern web interfaces, services, deployment and platform engineering."),
make("frontend","Frontend Engineering","Software","Browser engineering, design systems, accessibility and performance."),
make("backend","Backend Engineering","Software","Reliable services, APIs, databases, messaging systems and scalable platforms."),
make("mobile","Mobile Development","Software","Android, iOS and cross-platform application engineering."),
make("systems","Systems Programming","Software","Operating systems, memory, concurrency, compilers and runtimes."),
make("devops-cloud","DevOps & Cloud","Infrastructure","CI/CD, containers, infrastructure as code, orchestration and reliability."),
make("it-support","IT Support & Systems Administration","Infrastructure","Endpoints, identity, operating systems, servers and enterprise operations."),
make("networking","Computer Networking","Infrastructure","LANs, routing, switching, wireless, automation and enterprise design."),
make("telecom","Telecommunications & 5G/6G","Infrastructure","Mobile networks, radio access, core networks, fiber and future connectivity."),
make("data-engineering","Data Engineering","Data","Pipelines, warehouses, streaming, governance and production data platforms."),
make("data-science","Data Science & Analytics","Data","Statistics, experimentation, visualization, forecasting and decision systems."),
make("databases","Database Engineering","Data","Relational, NoSQL and distributed data systems with performance and reliability."),
make("gis","GIS & Geospatial Technology","Data","Maps, spatial databases, remote sensing and location intelligence."),
make("ai-ml","AI & Machine Learning","AI","Mathematical foundations, model development, evaluation and production AI systems."),
make("generative-ai","Generative AI & LLM Engineering","AI","Language and multimodal systems, retrieval, agents and production evaluation."),
make("computer-vision","Computer Vision","AI","Image processing, deep vision, detection, segmentation and edge deployment."),
make("nlp","Natural Language Processing","AI","Language data, transformers, search, ranking, speech and language applications."),
make("cybersecurity","Cybersecurity","Security","Security fundamentals across defensive, offensive, application, cloud and governance disciplines."),
make("ethical-hacking","Penetration Testing","Security","Authorized offensive security from reconnaissance through reporting and remediation."),
make("blue-team","Blue Team & SOC","Security","Detection engineering, SIEM, threat hunting, incident response and forensics."),
make("application-security","Application Security","Security","Secure software design, code review, vulnerability management and DevSecOps."),
make("electronics","Electronics Engineering","Hardware","Analog, digital, power, measurement and circuit design."),
make("embedded","Embedded Systems","Hardware","Firmware, microcontrollers, real-time systems, buses and hardware/software integration."),
make("iot","Internet of Things","Hardware","Connected devices, gateways, telemetry, security and fleet management."),
make("robotics","Robotics","Hardware","Mechanical systems, electronics, control, perception and autonomous robots."),
make("fpga","FPGA & Digital Design","Hardware","HDLs, RTL, verification, timing and programmable logic systems."),
make("semiconductors","Semiconductors & VLSI","Hardware","Integrated-circuit development from transistor physics to chip architecture and manufacturing."),
make("hardware-security","Hardware Security","Security","Secure boot, trusted execution, side-channel resistance and silicon security."),
make("blockchain","Blockchain & Web3","Emerging","Distributed ledgers, smart contracts, protocols, cryptography and decentralized systems."),
make("quantum","Quantum Computing","Emerging","Quantum information, algorithms, hardware concepts and hybrid computing."),
make("xr","AR / VR / XR","Emerging","Immersive computing across spatial interfaces, graphics, interaction and devices."),
make("space-tech","Space Technology","Emerging","Satellites, communications, embedded systems, ground systems and mission software."),
make("health-it","Health IT & Digital Health","Applied ICT","Healthcare information systems, interoperability, health data and digital platforms."),
make("fintech","FinTech Technology","Applied ICT","Payments, banking platforms, financial APIs, risk systems and secure digital finance."),
make("agritech","AgriTech & Smart Agriculture","Applied ICT","Connected agriculture using sensors, analytics, automation, drones and digital platforms."),
make("edtech","EdTech Technology","Applied ICT","Digital learning platforms, content systems, assessment tools and education data.")
];

export const ARTICLES=[
{id:"a1",slug:"ai-accelerators-are-becoming-the-new-computers",category:"AI",title:"AI accelerators are becoming the new computers",summary:"Why specialized silicon is reshaping software, cloud infrastructure and the devices builders will create.",image_url:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85",verified:true},
{id:"a2",slug:"security-story-inside-everyday-routers",category:"Cybersecurity",title:"The security story hiding inside everyday routers",summary:"A practical look at firmware, vulnerability disclosure and why updates matter.",image_url:"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=85",verified:true},
{id:"a3",slug:"african-builders-next-billion-connected-users",category:"Africa Tech",title:"African builders are designing for the next billion connected users",summary:"From fintech infrastructure to edge computing and digital public infrastructure.",image_url:"https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?auto=format&fit=crop&w=1400&q=85",verified:true}
];
export const PROJECTS=[
{id:"p1",title:"Arduino Smart Traffic Light",tech:"Arduino",level:"Beginner",duration:"2 h",parts:"Uno, LEDs, resistors, button",image_url:"https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1000&q=80"},
{id:"p2",title:"ESP32 Weather Station",tech:"ESP32",level:"Intermediate",duration:"5 h",parts:"ESP32, BME280, OLED",image_url:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80"},
{id:"p3",title:"AI Image Classifier",tech:"Python",level:"Intermediate",duration:"6 h",parts:"Laptop, webcam, TensorFlow",image_url:"https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1000&q=80"}
];