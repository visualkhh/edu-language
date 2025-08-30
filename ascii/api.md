curl 'https://api-cdn-plus.dioco.io/base_dict_getHoverDict_8?form=black&lemma=&sl=en&tl=ko&pos=ADJ&pow=n' \
-H 'accept: application/json, text/plain, */*' \
-H 'accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' \
-H 'dnt: 1' \
-H 'origin: https://www.languagereactor.com' \
-H 'priority: u=1, i' \
-H 'referer: https://www.languagereactor.com/' \
-H 'sec-ch-ua: "Chromium";v="139", "Not;A=Brand";v="99"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: cross-site' \
-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'

---

curl 'https://api-cdn-plus.dioco.io/base_dict_getFullDict_8?form=fundamentally&lemma=&sl=en&tl=ko&pos=ADV&pow=n' \
-H 'accept: application/json, text/plain, */*' \
-H 'accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' \
-H 'dnt: 1' \
-H 'origin: https://www.languagereactor.com' \
-H 'priority: u=1, i' \
-H 'referer: https://www.languagereactor.com/' \
-H 'sec-ch-ua: "Chromium";v="139", "Not;A=Brand";v="99"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: cross-site' \
-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'


---

curl 'https://api-cdn-plus.dioco.io/base_lexa_generate' \
-H 'accept: application/json, text/plain, */*' \
-H 'accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' \
-H 'content-type: application/json' \
-H 'dnt: 1' \
-H 'origin: https://www.languagereactor.com' \
-H 'priority: u=1, i' \
-H 'referer: https://www.languagereactor.com/' \
-H 'sec-ch-ua: "Chromium";v="139", "Not;A=Brand";v="99"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: cross-site' \
-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
--data-raw '{"promptWithPlaceHolders_translated":"이 문장에 사용된 단어와 함께 최대 5개의 예를 제공하십시오 <WORD> : <CONTEXT>. 고유한 예제와 번역만 출력합니다.","contextSentence":"systems, there are black boxes. With liquid, because we are fundamentally","word":"fundamentally","userLanguage_G":"ko","studyLanguage_G":"en","diocoToken":"A1WHzmRXTA+3P0875AumFxkD+aixj1g3htyhZpMQBJih7Kmd2fZZ1WOyDzCUpNxQCd4AHSxqeemONa4ey0q1SQ==","userEmail":"visualkhh@gmail.com"}'


---
curl 'https://api-cdn-plus.dioco.io/base_lexa_generate' \
-H 'accept: application/json, text/plain, */*' \
-H 'accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' \
-H 'content-type: application/json' \
-H 'dnt: 1' \
-H 'origin: https://www.languagereactor.com' \
-H 'priority: u=1, i' \
-H 'referer: https://www.languagereactor.com/' \
-H 'sec-ch-ua: "Chromium";v="139", "Not;A=Brand";v="99"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: cross-site' \
-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
--data-raw '{"promptWithPlaceHolders_translated":"이 문장에서 단어의 문법을 설명하십시오 <WORD> . <CONTEXT>","contextSentence":"systems, there are black boxes. With liquid, because we are fundamentally","word":"fundamentally","userLanguage_G":"ko","studyLanguage_G":"en","diocoToken":"A1WHzmRXTA+3P0875AumFxkD+aixj1g3htyhZpMQBJih7Kmd2fZZ1WOyDzCUpNxQCd4AHSxqeemONa4ey0q1SQ==","userEmail":"visualkhh@gmail.com"}'


---



curl 'https://api-cdn-plus.dioco.io/base_dict_getDictTTS_3?lang=en&text=fundamentally' \
-H 'accept: application/json, text/plain, */*' \
-H 'accept-language: ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' \
-H 'dnt: 1' \
-H 'origin: https://www.languagereactor.com' \
-H 'priority: u=1, i' \
-H 'referer: https://www.languagereactor.com/' \
-H 'sec-ch-ua: "Chromium";v="139", "Not;A=Brand";v="99"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "macOS"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: cross-site' \
-H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'