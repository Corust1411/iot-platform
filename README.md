<br># Multi-protocol IoT Platform

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white)

A comprehensive, full-stack IoT platform designed to manage and monitor devices across multiple wireless protocols including **Wi-Fi, Zigbee, and LoRaWAN**. The platform features Role-Based Access Control (RBAC), real-time telemetry ingestion using TimescaleDB, and dynamic dashboards.

## Features

- **Multi-protocol Support:** Seamlessly integrate Wi-Fi, Zigbee, and LoRaWAN devices.
- **Hardware Sync:** Automated synchronization with hardware gateways (Raspberry Pi/Node-RED/ChirpStack).
- **Role-Based Access Control (RBAC):** Distinct permissions for `Admin`, `User`, and `Viewer`.
- **Time-series Database:** High-performance telemetry storage using PostgreSQL + TimescaleDB.
- **Dynamic Dashboards (WIP):** Customizable widgets for real-time monitoring and control.

## Tech Stack

- **Frontend:** Vue.js 3, Vue Router, Axios
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL with TimescaleDB Extension
- **IoT/Gateway:** Raspberry Pi, Node-RED, Zigbee2MQTT, ChirpStack, MQTT Broker (Mosquitto)

# 📁 Project Structure

โปรเจกต์นี้แบ่งออกเป็น 2 ส่วนหลัก คือ `backend` (Node.js/Express) และ `website` (Vue.js) โดยใช้สถาปัตยกรรมแบบ Component-Based และ MVC

iot-platform/ 
<br>├── backend/
<br>│ ├── src/
<br>│ │ ├── config/
<br>│ │ ├── controllers/
<br>│ │ ├── routes/
<br>│ │ ├── services/
<br>│ │ └── server.ts
<br>│ ├── package.json
<br>│ └── tsconfig.json
<br>|
<br>├── website/
<br>│ ├── src/
<br>│ │ ├── api/
<br>│ │ ├── assets/
<br>│ │ ├── components/
<br>│ │ │ ├── widgets/
<br>│ │ ├── router/
<br>│ │ ├── views/
<br>│ │ ├── App.vue
<br>│ │ └── main.js
<br>│ ├── package.json
<br>│ └── vite.config.js
<br>│
<br>└── package.json

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) with [TimescaleDB](https://www.timescale.com/)
- An active MQTT Broker
