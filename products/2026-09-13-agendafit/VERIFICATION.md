# 검증 기록

실행일: 2026-09-13

## 명령

```bash
google-chrome --headless --no-sandbox --disable-gpu --user-data-dir=/tmp/agendafit-chrome-test --dump-dom http://127.0.0.1:18765/test-browser.html
python3 -c "import urllib.request; r=urllib.request.urlopen('http://127.0.0.1:18765/index.html'); print(r.status, r.headers.get_content_type())"
google-chrome --headless --no-sandbox --disable-gpu --user-data-dir=/tmp/agendafit-chrome-ui --dump-dom http://127.0.0.1:18765/index.html
git diff --check
```

## 실제 결과

```text
PASS 4 assertions groups: normal budget, overflow suggestion, input bounds, formatting
200 text/html
DOM_CHECK PASS rendered initial UI and saved state
(no output from git diff --check)
```

Chrome Headless에서 순수 계산 로직의 정상 예산·초과 축소·경계값·표시를 실행했다. 별도 로컬 HTTP 응답, 초기 요약(25분), 자동저장 상태를 확인했다.
