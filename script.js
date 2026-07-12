// ==========================================
// 1. 기본 데이터 설정 (멤버 및 커플링 명칭)
// ==========================================
const members = ["마틴", "제임스", "주훈", "성현", "건호"];
const labels = [
    ["", "젯틴", "훈틴", "엄틴", "껀틴"],
    ["틴젯", "", "눟젯", "셩젯", "낭젯"],
    ["틴훈", "젯쮸", "", "셩쮼", "낭쮼"],
    ["틴셩", "젯셩", "쭈엄", "", "낭셩"],
    ["틴껀", "젬껀", "쮸건", "엄껀", ""]
];

// ==========================================
// 2. 범주(라벨 및 색상) 상태 관리
// ==========================================
const defaultCategories = [
    { id: "otp", name: "OTP", color: "#ffdee2" },
    { id: "good", name: "좋음", color: "#fcead2" },
    { id: "normal", name: "보통", color: "#fefcd0" },
    { id: "pass", name: "스루", color: "#e5fcdb" },
    { id: "mine", name: "지뢰", color: "#dbf4fc" }
];

// 로컬스토리지에서 기존 커스텀 설정을 불러오고, 없으면 기본값 사용
let categories = JSON.parse(localStorage.getItem("cortis_categories")) || defaultCategories;

// DOM 요소 가져오기
const table = document.getElementById("rpsTable");
const picker = document.getElementById("picker");
let configContainer = document.getElementById("categoryConfig");

let selectedCell = null;

// ==========================================
// 3. 상단 설정 바 및 픽커 팝업 생성
// ==========================================
function initCategories() {
    // 만약 HTML에 categoryConfig 컨테이너가 없다면 표 위에 자동으로 생성하여 삽입합니다.
    if (!configContainer) {
        configContainer = document.createElement("div");
        configContainer.id = "categoryConfig";
        configContainer.style.cssText = "display: flex; gap: 15px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;";
        table.parentNode.insertBefore(configContainer, table);
    }
    
    configContainer.innerHTML = "";
    picker.innerHTML = ""; // 기존 하드코딩된 버튼들 초기화

    categories.forEach((category) => {
        // [A] 상단 색상+텍스트 설정 인풋 UI 생성
        const item = document.createElement("div");
        item.className = "config-item";
        item.style.cssText = "display: flex; align-items: center; gap: 6px; padding: 4px 8px; border: 1px solid #eee; border-radius: 20px; background: #fff;";

        item.innerHTML = `
            <input type="color" value="${category.color}" data-id="${category.id}" class="category-color-input" style="width:24px; height:24px; border:none; border-radius:50%; cursor:pointer; padding:0;">
            <input type="text" value="${category.name}" data-id="${category.id}" class="category-name-input" style="width:50px; border:none; border-bottom:1px solid #ccc; text-align:center; font-size:14px; font-weight:bold; outline:none; background:transparent;">
        `;
        configContainer.appendChild(item);

        // [B] 셀 클릭 시 뜰 팝업창(picker) 내부의 선택 버튼 동적 생성
        const pickBtn = document.createElement("button");
        pickBtn.className = "pick";
        pickBtn.dataset.colorId = category.id;
        pickBtn.style.backgroundColor = category.color;
        pickBtn.innerText = category.name;
        picker.appendChild(pickBtn);
    });

    // [C] 팝업창에 색상 '지우기' 버튼 추가
    const clearBtn = document.createElement("button");
    clearBtn.className = "pick clear";
    clearBtn.dataset.colorId = "";
    clearBtn.innerText = "지우기";
    picker.appendChild(clearBtn);

    // 인풋 및 버튼 이벤트 바인딩
    bindCategoryEvents();
    bindPickerEvents();
}

// ==========================================
// 4. 상단 설정 인풋 실시간 동기화 이벤트
// ==========================================
function bindCategoryEvents() {
    // 사용자가 색상 피커로 색을 변경할 때
    document.querySelectorAll(".category-color-input").forEach(input => {
        input.addEventListener("input", (e) => {
            const id = e.target.dataset.id;
            const targetCat = categories.find(c => c.id === id);
            if (targetCat) {
                targetCat.color = e.target.value;
                saveCategories();
                updateUI(); // 바뀐 색상 표와 팝업에 실시간 반영
            }
        });
    });

    // 사용자가 라벨 텍스트를 변경할 때
    document.querySelectorAll(".category-name-input").forEach(input => {
        input.addEventListener("input", (e) => {
            const id = e.target.dataset.id;
            const targetCat = categories.find(c => c.id === id);
            if (targetCat) {
                targetCat.name = e.target.value;
                saveCategories();
                updateUI(); // 바뀐 글자 실시간 반영
            }
        });
    });
}

// 범주 데이터 로컬스토리지 저장
function saveCategories() {
    localStorage.setItem("cortis_categories", JSON.stringify(categories));
}

// 색상/글자 실시간 UI 업데이트 함수
function updateUI() {
    // 팝업창 버튼 갱신
    document.querySelectorAll("#picker .pick").forEach(btn => {
        const id = btn.dataset.colorId;
        if (!id) return;
        const cat = categories.find(c => c.id === id);
        if (cat) {
            btn.style.backgroundColor = cat.color;
            btn.innerText = cat.name;
        }
    });

    // 표 내부 셀 색상 실시간 동기화
    document.querySelectorAll(".cell").forEach(cell => {
        const colorId = localStorage.getItem(cell.dataset.id);
        if (colorId) {
            const cat = categories.find(c => c.id === colorId);
            cell.style.backgroundColor = cat ? cat.color : "";
        }
    });
}

// ==========================================
// 5. 메인 표(Table) 생성 및 셀 선택
// ==========================================
function createTable() {
    let html = "<tr><th></th>";
    members.forEach(name => { html += `<th>${name}</th>`; });
    html += "</tr>";

    members.forEach((rowName, row) => {
        html += `<tr><th>${rowName}</th>`;
        members.forEach((_, col) => {
            if (row === col) {
                html += `<td class="disabled"></td>`;
            } else {
                html += `
                <td data-id="${row}-${col}" class="cell">
                    ${labels[row][col]}
                </td>`;
            }
        });
        html += "</tr>";
    });

    table.innerHTML = html;
    loadColors();     // 저장된 셀 색상 불러오기
    bindCellEvents(); // 셀 클릭 이벤트 연결
}

// 셀 클릭 시 팝업 띄우기
function bindCellEvents() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("click", e => {
            selectedCell = cell;
            picker.style.display = "flex";
            picker.style.left = `${e.pageX}px`;
            picker.style.top = `${e.pageY}px`;
        });
    });
}

// ==========================================
// 6. 팝업창(Picker)에서 색상 선택 시 적용
// ==========================================
function bindPickerEvents() {
    document.querySelectorAll("#picker .pick").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!selectedCell) return;

            const colorId = btn.dataset.colorId;

            if (colorId !== "") {
                const cat = categories.find(c => c.id === colorId);
                selectedCell.style.backgroundColor = cat ? cat.color : "";
                localStorage.setItem(selectedCell.dataset.id, colorId);
            } else {
                // '지우기' 선택 시
                selectedCell.style.backgroundColor = "";
                localStorage.removeItem(selectedCell.dataset.id);
            }

            picker.style.display = "none";
        });
    });
}

// 저장된 표의 셀 색상 불러오기
function loadColors() {
    document.querySelectorAll(".cell").forEach(cell => {
        const colorId = localStorage.getItem(cell.dataset.id);
        if (colorId) {
            const cat = categories.find(c => c.id === colorId);
            if (cat) cell.style.backgroundColor = cat.color;
        }
    });
}

// ==========================================
// 7. 기타 유틸리티 이벤트 (바깥 클릭, ESC 키 종료)
// ==========================================
window.addEventListener("click", e => {
    if (
        !picker.contains(e.target) &&
        !e.target.classList.contains("cell") &&
        !e.target.closest("#categoryConfig")
    ) {
        picker.style.display = "none";
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "Escape") picker.style.display = "none";
});

// ==========================================
// 8. 초기 실행 코드
// ==========================================
createTable();
initCategories();
