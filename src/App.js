import React, { useState } from 'react';
import { GoogleMap, LoadScript, } from '@react-google-maps/api';
import JSZip from 'jszip';

const containerStyle = {
  width: '1400px',
  height: '800px'
};

const center = {
  lat: 37.018000,
  lng: 127.835941
};

const MAP_API_KEY = //지도 api 키 입력
const MOUNTAIN_API_KEY = //등산로 api 키 입력

function App() {
  const [mountainName, setMountainName] = useState('');
  const [trailData, setTrailData] = useState(null);
  const [searchError, setSearchError] = useState(false); // 검색 오류 여부

  // 입력된 산 이름을 상태로 저장
  const handleInputChange = (event) => {
    setMountainName(event.target.value);
  };

  // 검색 버튼 눌렀을 때 호출
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!mountainName.trim()) {
      setSearchError(true);
      return; // 공백 검색시 검색을 수행하지 않음
    }
    try {
      // API를 호출하여 산 이름에 해당하는 등산로 정보를 가져옴
      const url = `http://openapi.forest.go.kr/openapi/service/trailInfoService/getforestspatialdataservice?mntnNm=${encodeURIComponent(mountainName)}&serviceKey=${MOUNTAIN_API_KEY}&pageNo=1&numOfRows=10&`;
      const response = await fetch(url);
      const data = await response.text();
      const data_info = new DOMParser().parseFromString(data, "text/xml");
      console.log("data", data_info);

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
        
      // XML에서 ZIP 파일 URL 추출
      const zipFileURL = xmlDoc.getElementsByTagName('mntnfile')[0].textContent;

      // ZIP 파일 다운로드 및 내부 파일 접근
      handleZipFile(zipFileURL);

      // 받아온 데이터가 없으면 검색 결과가 없음을 알리는 메시지를 표시
      if (data_info.getElementsByTagName('totalCount')[0].textContent === '0') {
        setSearchError(true);
      } else {
        setTrailData(data_info); 
        setSearchError(false); // 검색 오류 상태 초기화
      }
    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
      setSearchError(true); 
    }
  };

  //받아온 ZIP파일 처리 함수
  const handleZipFile = async (zipFileURL) => {
    try {
        // ZIP 파일 다운로드
        const zipResponse = await fetch(zipFileURL);
        const zipBlob = await zipResponse.blob();

        // JSZip을 사용하여 ZIP 파일 해제
        const zip = await JSZip.loadAsync(zipBlob);

        // ZIP 파일 내의 파일 목록 확인
        zip.forEach((relativePath, zipEntry) => {
            //파일 이름 출력
            console.log("File:", relativePath);
            
            // 파일 내용
            zipEntry.async("string").then((content) => {
                //console.log("Contents:", content);
            });
        });
    } catch (error) {
        console.error('ZIP 파일을 다운로드하거나 해제하는 중 오류가 발생했습니다:', error);
    }
};

  return (
    <div className="App">
      <header>
        <h1>구글 지도 위에 등산로 표시하기</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <label>
          찾으려는 산 이름을 검색하세요:
          <input
            type="text"
            value={mountainName}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">검색</button>
      </form>
      {trailData && <p>{mountainName}에 대한 등산로 정보를 검색합니다.</p>}
      {searchError && <p>검색 결과가 없습니다.</p>}
      <div>
        <LoadScript
          googleMapsApiKey={MAP_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
          >
            {/* 등산로 정보를 표시하는 기능(추가예정)*/}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default App;

