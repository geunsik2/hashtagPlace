from selenium import webdriver as wd
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs4
from datetime import datetime
import pandas as pd
import time, re
import datetime

# 서비스 시작 시간 기록
start = time.time()

# ChromeOptions 설정
chrome_options = Options()
chrome_options.add_argument('--ignore-local-proxy')

# Chrome 브라우저의 실행 파일 위치를 명시적으로 지정
chrome_binary_location = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

# ChromeOptions에 binary_location 설정 추가
chrome_options.binary_location = chrome_binary_location

# ChromeDriver 서비스 설정
chrome_driver_service = wd.chrome.service.Service(executable_path='/opt/homebrew/bin/chromedriver')

# 검색어 조건에 따른 url 생성
def insta_searching(word:str) -> str:
    url = f'https://www.instagram.com/explore/tags/{word}'
    return url

# 첫 번째 게시물 클릭
def select_first(driver) -> None:
    first = driver.find_elements(By.CSS_SELECTOR, "div._aabd._aa8k._al3l")[0]
    first.click()
    time.sleep(3)
    
# 본문 내용, 해시태그, 위치 정보 가져오기
def get_content(driver) -> list:
    html = driver.page_source
    soup = bs4(html, 'lxml')
    
    # 본문 내용
    try:
        content = soup.select('div._a9zs')[0].text
        
    except:
        content = ''
    
    # 해시태그
    tags = re.findall(r'#[^\s#,\\]+', content)

    # 위치정보
    try:
        place = soup.select('div._aaqm')[0].text
    except:
        place = ''
    
    data = [content, tags, place]
    
    return data

# 첫 번째 게시물 클릭 후 다음 게시물 클릭
def move_next(driver, count:int) -> None:
    if(count != 0):
        right = driver.find_elements(By.CSS_SELECTOR, "button._abl-")[1]
        right.click()
        time.sleep(3)
        
        return
    else:
        right = driver.find_elements(By.CSS_SELECTOR, "button._abl-")[0]
        right.click()
        time.sleep(3)
        
        return

# 크롤링 시작
"""
driver.get(url)을 통해 검색 페이지 접속하고,
target 변수에 크롤링한 게시물의 수를 바인딩
"""

# 크롬 브라우저 열기
driver = wd.Chrome(service=chrome_driver_service, options=chrome_options)

driver.get('https://www.instagram.com')
time.sleep(3)

# 인스타그램 로그인을 위한 계정 정보
username = "5_5ik"  # ID
input_id = driver.find_element(By.NAME, 'username')
input_id.clear()
input_id.send_keys(username)

password = "rmstlr7089!@"   # PW
input_pw = driver.find_element(By.NAME, "password")
input_pw.clear()
input_pw.send_keys(password)
input_pw.submit()
time.sleep(5)

# 검색할 키워드 입력
word = input("검색어를 입력하세요 : ")
url = insta_searching(word)

# 검색 결과 페이지 열기
driver.get(url)
time.sleep(10)  # 페이지가 로드될 때까지 10초 대기

# 첫 번째 게시물 클릭
select_first(driver)

result = []

# 수집할 게시물 수
target = 10000

for i in range(target):
    try:
        data = get_content(driver)
        result.append(data)
        move_next(driver, i)
    
    except:
        time.sleep(2)
        move_next(driver, i)
        time.sleep(3)

print(result[:2])

date = datetime.today().strftime('%Y-%m-%d')

# 결과를 데이터프레임으로 저장
result_df = pd.DataFrame(result)
result_df.columns = ['content', 'tags', 'place']
result_df.to_csv(date + '_about_' + word + '_insta_crawling.csv', encoding='utf-8-sig')

# 서비스 종료 시간 기록
end = time.time()

# 서비스 완료 시간 출력
sec = (end - start)
result_time = str(datetime.timedelta(seconds=sec)).split(".")
print(result_time[0])