# 예스케어 웹사이트 운영

## GitHub 저장소 인계

1. 새 소유자의 공개 GitHub 저장소로 사이트를 이전하거나 복사합니다.
2. `public/news-config.json`의 `repository`를 새 저장소의 `소유자/저장소`로 바꾸고 기본 브랜치에 반영합니다.
3. GitHub Pages 게시 위치를 기본 브랜치의 루트로 지정하고 GitHub Actions를 사용할 수 있는지 확인합니다.

`Sync YesCare blog news`는 동기화 코드나 설정이 기본 브랜치에 반영되면 첫 수집을 시작합니다. 이후 3시간마다 네이버 블로그 공개 RSS를 읽습니다. 같은 이름의 Actions 화면에서 실행 결과를 확인하거나 수동으로 다시 수집할 수 있습니다.

수집 결과는 해당 저장소의 `yescare-news` 브랜치에 있는 `news.json`으로 저장합니다. 첫 수집 전이나 데이터 주소에 접속할 수 없을 때는 홈페이지에 준비된 소식 목록을 표시합니다. 저장소에서 직접 제공하는 `GITHUB_TOKEN`을 사용하므로 인계받은 사람이 별도 토큰을 발급할 필요는 없습니다.

공개 저장소에 60일 동안 활동이 없으면 GitHub가 예약 실행을 중단할 수 있습니다. 이 경우 Actions에서 상태를 확인하고 워크플로를 다시 활성화합니다.

- [GitHub Pages 게시 위치 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Actions 예약 실행 안내](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
