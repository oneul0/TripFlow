// Hand-authored demonstration fixtures, not live public-data results.
export const samplePlaces=[
 ['1','성산일출봉','제주 서귀포시 성산읍','39','12','오름 너머, 바다와 마주하는 시간','coast'],
 ['2','협재해수욕장','제주 제주시 한림읍','39','12','맑은 바다와 하얀 모래를 걷는 오후','sea'],
 ['3','제주 돌담 식탁','제주 제주시 애월읍','39','39','제철 재료로 만나는 제주 한 끼','food'],
 ['4','제주 바다 스테이','제주 서귀포시','39','32','파도 소리와 함께 쉬어가는 밤','stay'],
 ['5','국립중앙박물관','서울 용산구 서빙고로','1','14','일상 속에서 만나는 오래된 이야기','culture'],
 ['6','경복궁','서울 종로구 사직로','1','12','도시 한가운데 남아 있는 고요','palace'],
 ['7','부산 바다 축제','부산 해운대구','6','15','바다와 음악이 만드는 여름의 기억','festival'],
 ['8','남해 해안 여행코스','경남 남해군','36','25','느리게 달리는 해안의 풍경','coast'],
 ['9','강릉 해변 산책','강원 강릉시','32','28','바람 따라 이어지는 가벼운 발걸음','sea'],
 ['10','전주 공예 상점','전북 전주시 완산구','37','38','작은 골목에서 발견하는 취향','shop'],
 ['11','부산 로컬 식탁','부산 수영구','6','39','여행의 기억을 채우는 따뜻한 한 끼','food'],
 ['12','서울 골목 스테이','서울 종로구','1','32','동네의 속도로 머무는 하루','stay']
].map(([contentId,title,address,areaCode,contentTypeId,description,scene])=>({contentId,title,address,areaCode,contentTypeId,description,scene,imageUrl:''}));

// Coordinates are demonstration anchors, not verified operating information.
const anchors={'5':[126.98,37.524],'6':[126.977,37.579],'12':[126.985,37.574]};
for(const place of samplePlaces){const coord=anchors[place.contentId];if(coord){place.longitude=coord[0];place.latitude=coord[1];}}
const clusters=[['종로',126.985,37.582,7],['용산',126.975,37.535,5],['마포',126.921,37.558,4],['성동',127.045,37.554,3],['강남',127.045,37.502,2]];
for(const [name,lon,lat,count] of clusters)for(let i=0;i<count;i++){
 const contentTypeId=['12','14','39','32'][i%4];
 samplePlaces.push({contentId:`demo-${name}-${i}`,title:`${name} 발견 ${i+1} · 샘플`,address:`서울 ${name}구 · 합성 장소`,areaCode:'1',contentTypeId,description:'밀도와 지도 탐색을 확인하기 위한 가상 장소',scene:['coast','culture','food','stay'][i%4],imageUrl:'',longitude:lon+(i%3-1)*.003,latitude:lat+(Math.floor(i/3)-1)*.002});
}
