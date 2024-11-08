Infomation about my Testing

Frontend developed by ReactJs
Backend developed by Nodejs

setup
1. Download

2. for Frontend
    -cd rice_frontend
    -npm i 
    -npm start

3. for Backend 
    -cd rice_backend
    -npm i 
    -node server.js

This project's Limitation :
- On this project Data will be save at data.json (if not have this json file it will be created automatically).
- the function about calculating rice is on the frontend, backend role on this project is reading and writing data on data.json
- example data that in data.json

{
    "ID": "18d76508-167d-4fa6-9c5e-190c6a3c3c3e",
    "ID_Inspect": "e562a660-47b6-4d90-93fe-1d10dc165bba",
    "name": "test ระบบ",
    "standard": "มาตรฐานข้าวชั้น 1",
    "imgUrl": "https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp",
    "upload": "raw.json",
    "note": "ดูแล้ว",
    "price": "1000",
    "samplingPoints": [
      "Back End",
      "Front End"
    ],
    "dateTime": "2024-11-06T17:36",
    "dateTimeSubmitted": "2024-11-08T08:36:46.136Z",
    "dateLastUpdate": "2024-11-08T08:37:17.458Z",
    "standardData": [
      {
        "conditionMax": "LT",
        "conditionMin": "GT",
        "key": "wholegrain",
        "name": "ข้าวเต็มเมล็ด",
        "shape": [
          "wholegrain",
          "broken"
        ],
        "maxLength": 99,
        "minLength": 7
      },
      {
        "conditionMax": "LT",
        "conditionMin": "GT",
        "key": "broken_rice1",
        "name": "ข้าวหักใหญ่",
        "shape": [
          "wholegrain",
          "broken"
        ],
        "maxLength": 7,
        "minLength": 3.5
      },
      {
        "conditionMax": "LT",
        "conditionMin": "GT",
        "key": "broken_rice2",
        "shape": [
          "wholegrain",
          "broken"
        ],
        "name": "ข้าวหักทั่วไป",
        "maxLength": 3.5,
        "minLength": 0
      }
    ],
    "typeweight": {
      "white": "51.61",
      "chalky": "46.09",
      "yellow": "1.72",
      "undermilled": "0.48",
      "glutinous": "0.10"
    },
    "shapeweight": {
      "ข้าวเต็มเมล็ด": "42.40",
      "ข้าวหักใหญ่": "57.54",
      "ข้าวหักทั่วไป": "0.06"
    },
    "totalGrains": 1033
  }


what's the new thing I have to learn for coding this project?
- How to read and write in json file.

what can improve on this project? (Just in case improving myself in the future, if I have more time)
- better UX/UI (ex. responsive).
- move function from frontend to backend.
- make some code reusable.
