const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`

export const IMG = {
  chip: u('1562408590-e32931084e23'),
  board: u('1592659762303-90081d34b277'),
  solder: u('1640955785023-1854685dae05'),
  dc: u('1584169417032-d34e8d805e8b'),
  cables: u('1558494949-ef010cbdcc31'),
  racks: u('1695668548342-c0c1ad479aee'),
  robot: u('1655393001768-d946c97d6fd1'),
  arm: u('1531746790731-6c087fecd65a'),
  kigali: u('1687986261123-b17f08f2796c'),
  kigali2: u('1708772565599-2c4e4b3ed9db'),
  flat: u('1555664424-778a1e5e1b48'),
  pcb: u('1603732551658-5fabbafa84eb'),
  green: u('1586920740199-47ce35183cfd'),
}

export type Article = {
  id: string
  cat: string
  title: string
  sub: string
  summary: string
  img: string
  date: string
  read: string
  author: string
  source: string
}

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    cat: 'Semiconductors',
    title: 'Inside the race to build the AI accelerator that costs a tenth of a GPU',
    sub: 'A wave of inference-first silicon is rewriting the economics of running large models, and the first chips are already in racks.',
    summary: 'Inference-first silicon is challenging the GPU on cost per token. Here is what changed underneath.',
    img: IMG.chip,
    date: 'Oct 4, 2026',
    read: '9 min',
    author: 'Amina Uwase',
    source: 'IEEE Spectrum, ISSCC proceedings',
  },
  {
    id: 'a2',
    cat: 'Cybersecurity',
    title: 'A zero-day in a popular router firmware sat unpatched for 11 months',
    sub: 'Researchers traced the flaw to a decade-old parsing routine shipped in dozens of consumer devices.',
    summary: 'Researchers trace a flaw to a decade-old parsing routine shipped in dozens of devices.',
    img: IMG.cables,
    date: 'Oct 3, 2026',
    read: '6 min',
    author: 'Eric Habimana',
    source: 'CERT advisory, vendor disclosure',
  },
  {
    id: 'a3',
    cat: 'Africa Tech',
    title: 'Kigali is now home to the continent’s first public edge-compute grid',
    sub: 'Municipal micro data centers cut latency for fintech and health apps by more than half.',
    summary: 'Municipal micro data centers cut latency for fintech and health apps by more than half.',
    img: IMG.kigali,
    date: 'Oct 2, 2026',
    read: '7 min',
    author: 'Diane Mukamana',
    source: 'RISA, Ministry of ICT',
  },
  {
    id: 'a4',
    cat: 'Robotics',
    title: 'Low-cost robot arms are entering university labs across East Africa',
    sub: 'Open hardware designs and 3D-printed joints are putting real manipulators in student hands.',
    summary: 'Open hardware and 3D-printed joints are putting real manipulators in student hands.',
    img: IMG.arm,
    date: 'Oct 1, 2026',
    read: '5 min',
    author: 'Kevin Otieno',
    source: 'University lab reports',
  },
  {
    id: 'a5',
    cat: 'Cloud',
    title: 'Why your next deploy will probably run on a machine you never see',
    sub: 'Serverless GPUs and regional zones change how small teams ship.',
    summary: 'Serverless GPUs and regional zones change how small teams ship.',
    img: IMG.racks,
    date: 'Sep 30, 2026',
    read: '8 min',
    author: 'Grace Wanjiru',
    source: 'Provider engineering blogs',
  },
]

export const TOPICS = [
  { n: '01', t: 'AI', d: '142 stories', img: IMG.chip },
  { n: '02', t: 'Robotics', d: '64 stories', img: IMG.robot },
  { n: '03', t: 'Cybersecurity', d: '98 stories', img: IMG.cables },
  { n: '04', t: 'Quantum', d: '31 stories', img: IMG.board },
  { n: '05', t: 'Semiconductors', d: '77 stories', img: IMG.solder },
  { n: '06', t: 'Cloud', d: '88 stories', img: IMG.dc },
  { n: '07', t: 'IoT', d: '59 stories', img: IMG.flat },
  { n: '08', t: 'Space Tech', d: '42 stories', img: IMG.pcb },
]

export const PROJECTS = [
  { t: 'Arduino Smart Traffic Light', tech: 'Arduino', diff: 'Beginner', time: '2 h', parts: 'Uno, 3 LEDs, 220Ω resistors, button', by: 'Jean Paul N.', pct: 25, img: IMG.flat },
  { t: 'ESP32 Weather Station', tech: 'ESP32', diff: 'Intermediate', time: '5 h', parts: 'ESP32, BME280, OLED, LiPo', by: 'Aline K.', pct: 55, img: IMG.pcb },
  { t: 'AI Image Classifier', tech: 'Python', diff: 'Intermediate', time: '6 h', parts: 'Laptop, webcam, TensorFlow Lite', by: 'Samuel B.', pct: 60, img: IMG.chip },
  { t: 'IoT Home Monitor', tech: 'MQTT', diff: 'Advanced', time: '10 h', parts: 'ESP32, PIR, DHT22, Pi Zero', by: 'Chantal I.', pct: 80, img: IMG.green },
  { t: 'Cybersecurity Lab', tech: 'Linux', diff: 'Advanced', time: '8 h', parts: 'Two VMs, Wireshark, Kali', by: 'Eric H.', pct: 85, img: IMG.cables },
  { t: 'Raspberry Pi Server', tech: 'Raspberry Pi', diff: 'Beginner', time: '3 h', parts: 'Pi 5, SSD, case, Ethernet', by: 'Diane M.', pct: 35, img: IMG.board },
]

export const PATHS = [
  { t: 'Software Engineering', steps: ['Beginner', 'Intermediate', 'Advanced'] },
  { t: 'AI', steps: ['Python', 'Machine Learning', 'Deep Learning', 'AI Engineering'] },
  { t: 'Electronics', steps: ['Circuits', 'Arduino', 'Sensors', 'ESP32', 'IoT'] },
  { t: 'Cybersecurity', steps: ['Networking', 'Linux', 'Security', 'Ethical Hacking', 'Defense'] },
  { t: 'Web Development', steps: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js'] },
]

export const BIT = {
  Beginner: {
    h: 'A chip that does one job really fast.',
    p: 'Your phone’s processor is a generalist. An AI accelerator is a specialist: it only does the kind of maths AI needs, but it does enormous amounts of it at once, using far less power.',
    tags: ['Specialist chip', 'Faster AI', 'Less energy'],
    layers: 1,
  },
  Developer: {
    h: 'Matrix multiplication in hardware.',
    p: 'Neural networks are mostly matrix multiplies. Accelerators like GPUs, TPUs and NPUs expose thousands of parallel multiply-accumulate units. You target them through CUDA, XLA or ONNX runtimes, and batch sizes and memory layout decide your throughput.',
    tags: ['MAC arrays', 'CUDA / XLA', 'Batching'],
    layers: 2,
  },
  Engineer: {
    h: 'Dataflow, SRAM and the memory wall.',
    p: 'The bottleneck is rarely compute. It is moving weights. Systolic arrays keep operands local, HBM stacks widen bandwidth, and quantisation to INT8 or FP4 shrinks the traffic. Designs are judged on TOPS per watt and bytes per FLOP.',
    tags: ['Systolic array', 'HBM bandwidth', 'INT8 / FP4'],
    layers: 3,
  },
} as const

export const ASK: Record<string, string> = {
  'What is a GPU?': 'A GPU is a processor with thousands of small cores built to run the same operation on lots of data at once. Born for graphics, it now trains and runs most AI models.',
  'How does ChatGPT work?': 'It is a transformer: text becomes tokens, tokens become vectors, and layers of attention weigh which earlier words matter. It predicts the next token, over and over, until a reply forms.',
  'What is an ESP32?': 'A low-cost microcontroller with built-in Wi-Fi and Bluetooth. It is the workhorse of hobby IoT: read a sensor, connect to a network, send the data, all for a few dollars.',
  'What is zero-day security?': 'A zero-day is a vulnerability the vendor does not know about yet. Defenders have had zero days to fix it, so attackers hold the advantage until a patch ships.',
  'Explain quantum computing.': 'Qubits can sit in a blend of 0 and 1 and become entangled. Clever algorithms steer those states so wrong answers cancel out, which helps with a narrow set of problems.',
}
