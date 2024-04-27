import React from 'react';
import { GoogleMap, LoadScript, } from '@react-google-maps/api';

const containerStyle = {
  width: '1400px',
  height: '800px'
};

const center = {
  lat: 37.018000,
  lng: 127.835941
};

const MAP_API_KEY = //여기에 지도 api 키 입력
const MOUNTAIN_API_KEY = //여기에 등산로 api 키 입력

async function getData(){
  const url=`http://openapi.forest.go.kr/openapi/service/trailInfoService/getforestspatialdataservice?mntnNm=고리봉&serviceKey=${MOUNTAIN_API_KEY}&pageNo=1&numOfRows=10&`
  const response=await fetch(url);
  const data=await response.text();
  let data_info = new DOMParser().parseFromString(data, "text/xml");
  console.log("data",data_info);
}
getData();

function App() {

  return (
    <div className="App">
      <header>
        <h1>구글 지도 위에 등산로 표시하기</h1>
      </header>
      <div>
        <LoadScript
          googleMapsApiKey={MAP_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
          > </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default App;

