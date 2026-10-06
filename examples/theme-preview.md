---
tags:
  - saffron-ink
  - theme-preview
status: preview
---

# H1 사프란 잉크 Saffron Ink 800

## H2 읽고 쓰는 공간 Reading and writing 700

### H3 문서의 구조 Document structure 600

#### H4 생각을 연결하기 Connected ideas 500

##### H5 작은 세부사항 Small details 400

###### H6 가벼운 제목 Light heading 300

한글과 English가 함께 있는 문서입니다. 사용자 글꼴과 글자 크기를 유지하면서 각 제목의 굵기를 비교합니다.
**굵은 본문**, *기울임*, ~~취소선~~, ==하이라이트==와 `인라인 코드`를 확인합니다.

[외부 링크](https://obsidian.md), [[theme-preview|내부 링크]], [[Saffron Ink Missing Note|미해결 링크]], #saffron-ink

> 생각을 정리하는 문장은 녹색 인용문으로 나타납니다.
>
> 두 번째 문단과 **강조**, `코드`, [링크](https://obsidian.md)를 함께 확인합니다.

- 첫 번째 항목
- 두 번째 항목
  - 중첩 항목

1. 첫 번째 순서
2. 두 번째 순서

- [ ] 미완료 작업
- [x] 완료 작업

| 항목 | 값 | 설명 |
| --- | --- | --- |
| 배경 | #eddfb7 | 사프란 종이 |
| 본문 | #000000 | 검은 잉크 |
| 제목 | 800부터 300 | 여섯 단계 |

---

> [!note] 참고
> 편집 모드와 읽기 모드에서 색감과 가독성을 비교합니다.

> [!tip] 도움말
> 제목의 글꼴은 사용자 설정을 따릅니다.

> [!success] 완료
> 설치 파일은 저장소에서 복사합니다.

> [!warning] 주의
> 사용 중인 글꼴에 굵기 파일이 없다면 일부 제목은 비슷하게 보일 수 있습니다.

> [!danger] 오류
> 경고와 오류의 구분을 확인합니다.

> [!example]- 접힌 예제
> 펼친 상태와 접힌 상태를 비교합니다.

```javascript
// 한국어 주석과 English comment
const theme = { name: "Saffron Ink", version: 0.1 };
function greet(name) {
  return `Hello, ${name}!`;
}
console.log(greet(theme.name));
```

```python
# 한글 주석
def heading_weights():
    return [800, 700, 600, 500, 400, 300]

print(heading_weights())
```

```json
{
  "name": "Saffron Ink",
  "light": true,
  "weights": [800, 700, 600, 500, 400, 300]
}
```

수식: $a^2 + b^2 = c^2$

긴 문단의 가독성을 확인합니다. 사프란 종이색 배경 위의 검은 글자는 한글과 영문을 함께 읽을 때에도 명확해야 합니다. 제목, 본문, 인용문, 코드와 링크는 각자의 역할에 따라 구분되며 줄바꿈과 문단 사이 간격도 자연스러워야 합니다. 실제 사용 중인 글꼴과 기본 글자 크기를 바꾸지 않고 화면을 비교합니다.
