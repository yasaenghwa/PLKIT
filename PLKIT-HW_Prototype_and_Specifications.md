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
![Layout](https://github.com/user-attachments/assets/64c991fd-f825-4c49-a366-f9cd345c22cb)




## 3D Modeling
![3D_Modeling](https://github.com/user-attachments/assets/4bc3bfb2-86b6-470d-bcf3-b8d77a05d5dc)




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
![frame](https://github.com/user-attachments/assets/6e642f39-6e9d-4742-845a-108cccb2e092)

### Module
![module](https://github.com/user-attachments/assets/e87d6f9a-8c58-4337-9c73-c003b9fe42da)


### Module connection method
- Power Connection
  - connected</br>
![Power_connected](https://github.com/user-attachments/assets/d4990391-ba12-4f1d-b989-9ac842c95b0b)

  - disconnected</br>
![Power_disconnected](https://github.com/user-attachments/assets/a01b62d1-46c7-4bf7-a825-ac51d8c82283)

    
- Fluid Connection
 	- connected</br>
![Fluid_connected](https://github.com/user-attachments/assets/910b2c7d-beae-4786-8565-196311225d82)

  - disconnected</br>
![Fluid_disconnected](https://github.com/user-attachments/assets/d565f658-afab-4ef3-aa76-5c378b424fa3)
