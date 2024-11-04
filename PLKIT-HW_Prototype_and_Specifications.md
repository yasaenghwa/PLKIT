# PLKIT-HW

## Index

- Overview
- Layout
- 3D Modeling
- Specification
- Prototype
  - Frame
  - Module
  - Module connection method


## Overview
The PLKIT-HW document explains how to design a prototype of the R&D module smart farm kit. This document contains the layout of the smart farm, 3D modeling images, module connected/disconnected method,  specifications, and prototype images.


## Layout
![Layout](https://github.com/user-attachments/assets/d6a8a958-abbc-4e55-9e2a-9bdd0ef106d4)



## 3D Modeling
![3D_Modeling](https://github.com/user-attachments/assets/cf3a104f-3532-4c0b-a584-23614b0dfd3c)



## Specification

<table>
    <tr>
        <th colspan="3">PLKIT</th>
    </tr>
    <tr>
        <td style="background-color: gray"><strong>Cultivation Method</strong></td>
        <td colspan="2">Deep Water Culture</td>
    </tr>
    <tr>
        <td style="background-color: gray"><strong>Board</strong></td>
        <td colspan="2">Raspberry Pi 4 8GB, ESP32-S</td>
    </tr>
    <tr>
        <td style="background-color: gray" rowspan="2"><strong>Module Connection Method</strong></td>
        <td>Power connection</td>
        <td>Magnetic Charger</td>
    </tr>
    <tr>
        <td>Fluid connection</td>
        <td>Quick Connector</td>
    </tr>
</table>

<table>
    <tr>
        <th style="background-color: gray">Sensor</th>
        <th style="background-color: gray"**>Type</th>
        <th style="background-color: gray">Range</th>
        <th style="background-color: gray">Unit</th>
    </tr>
    <tr>
    <td rowspan="2"><strong>Temperature/Humidity Sensor</strong></td>
        <td>Temperature</td>
        <td>-40 ~ 80</td>
        <td>°C</td>
    </tr>
    <tr>
        <td>Humidity</td>
        <td>0 ~ 100</td>
        <td>%</td>
    </tr>
    <tr>
    <td><strong>Temperature Sensor</strong></td>
        <td>Temperature</td>
        <td>-55 ~ 150</td>
        <td>°C</td>
    </tr>
    <tr>
    <td><strong>Photoresistor</strong></td>
        <td>Illuminance</td>
        <td>0 ~ 100</td>
        <td>%</td>
    </tr>
    <tr>
    <td><strong>TDS Sensor</strong></td>
        <td>Concentration</td>
        <td>0 ~ 1000</td>
        <td>ppm</td>
    </tr>
    <tr>
        <td><strong>Water Level Sensor</strong></td>
        <td>Fluid Level</td>
        <td>0 ~ 100</td>
        <td>%</td>
    </tr>
</table>

<table>
    <tr>
        <th style="background-color: gray">Control Device</th>
        <th style="background-color: gray">Type</th>
    </tr>
    <tr>
    <td><strong>Pump</strong></td>
        <td>Fluid</td>
    </tr>
    <tr>
    <td><strong>Fan</strong></td>
        <td>Temperature/Humidity</td>
    </tr>
    <tr>
    <td><strong>Heating Pad</strong></td>
        <td>Temperature</td>
    </tr>
    <tr>
    <td><strong>LED</strong></td>
        <td>Light</td>
    </tr>
</table>

## Prototype
### Frame
  
![Frame](https://github.com/user-attachments/assets/a70fa3ef-e3a9-408e-abf2-d94e5f4b8bf4)

### Module
  
![Module](https://github.com/user-attachments/assets/d69b4c3b-db7e-4e1a-a68a-9724f92aa648)

### Module connection method
- Power Connection
  - connected</br>
    ![Power Connection_connected](https://github.com/user-attachments/assets/ce3be448-0bcd-4ba8-a194-2ba8386ceafa)
  - disconnected</br>
    ![Power Connection_disconnected](https://github.com/user-attachments/assets/b092ccfc-dcd9-4dd2-9696-9916cecbb2b1)
    
- Fluid Connection
 		- connected</br>
   ![Fluid connection_connected](https://github.com/user-attachments/assets/d655941c-fc06-4411-a0ee-8da15e5fc357)
  - disconnected
