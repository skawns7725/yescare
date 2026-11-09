"""Write public YesCare blog post metadata as a small JSON feed."""

from datetime import timedelta, timezone
from email.utils import parsedate_to_datetime
import json
import re
from urllib.request import urlopen
from xml.etree import ElementTree

RSS_URL = "https://rss.blog.naver.com/yescare2026_new.xml"
POST_URL = re.compile(r"https://blog\.naver\.com/yescare2026_new/(\d+)(?:\?.*)?")
TOPICS = {
    "행복한 일상 이야기": "daily",
    "재활,인지 작업 치료": "therapy",
    "건강과 돌봄 (촉탁의,간호)": "health",
    "식단표": "meal",
}
SEOUL = timezone(timedelta(hours=9))


def parse_posts(xml):
    posts = {}
    for item in ElementTree.fromstring(xml).findall("./channel/item"):
        title = " ".join(item.findtext("title", "").split())
        url = POST_URL.fullmatch(item.findtext("link", "").strip())
        topic = TOPICS.get(" ".join(item.findtext("category", "").split()))
        if not (title and url and topic):
            continue
        try:
            published = parsedate_to_datetime(item.findtext("pubDate", ""))
        except ValueError:
            continue
        if published.tzinfo is None:
            continue
        post_id = url.group(1)
        posts.setdefault(post_id, (published, {
            "id": post_id,
            "title": title[:160],
            "date": published.astimezone(SEOUL).date().isoformat(),
            "topic": topic,
        }))
    ordered = sorted(posts.values(), key=lambda post: post[0], reverse=True)
    return [post for _, post in ordered[:20]]


if __name__ == "__main__":
    with urlopen(RSS_URL, timeout=20) as response:
        posts = parse_posts(response.read(1_000_000))
    if not posts:
        raise SystemExit("No supported posts in the public YesCare RSS feed.")
    print(json.dumps(posts, ensure_ascii=True, indent=2))
