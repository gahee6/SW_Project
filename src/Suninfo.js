import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const SUN_API_KEY = "GM2bKdaGinIelgRZx7EEEyYv27HTHfFwZruRfGFxIWsjag8Xj%2BMATGK5rS38CISJTlRIIziNpe4eiVFpW97zlQ%3D%3D";

function Suninfo() {
  const [sunData, setSunData] = useState({ sunrise: '', sunset: '' });

  const formatTime = (timeStr) => {
    return timeStr ? `${timeStr.slice(0, 2)}:${timeStr.slice(2)}` : '';
  };

  const getData = useCallback(async () => {
    const today = new Date();
    const locdate = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');

    const url = `http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo?ServiceKey=${SUN_API_KEY}&locdate=${locdate}&location=서울`;
    const response = await fetch(url);
    const dataText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(dataText, "application/xml");

    const sunrise = xmlDoc.getElementsByTagName('sunrise')[0].textContent;
    const sunset = xmlDoc.getElementsByTagName('sunset')[0].textContent;
    setSunData({ sunrise: formatTime(sunrise), sunset: formatTime(sunset) });
  }, []); // 의존성 배열이 비어있어서 컴포넌트가 마운트될 때만 생성됩니다.

  useEffect(() => {
    getData();
  }, [getData]); // getData는 변하지 않기 때문에 useEffect는 한 번만 실행됩니다.

  return (
    <div className="Suninfo">
      <header className="App-header">
        <h1>오늘의 일출, 일몰 시간을 알려드려요</h1>
      </header>
      <div>
        <p>일출 시간: {sunData.sunrise}</p>
        <p>일몰 시간: {sunData.sunset}</p>
      </div>
      <Link to="/app"><button>돌아가기</button></Link>
    </div>
  );
}

export default Suninfo;




