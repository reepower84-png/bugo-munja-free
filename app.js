// ===== 상태 관리 =====
let currentStep = 1;

// ===== 텔레그램 알림 =====
const TELEGRAM_BOT_TOKEN = '8124413385:AAHY7vYtJwHIt2eJ2bb9YdES6-NUrHlTCYk';
const TELEGRAM_CHAT_ID = '5454616674';

async function sendTelegramNotification(message) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (e) {
        // 알림 실패해도 무시
    }
}

// 기존 호환용 - embed를 텔레그램 텍스트로 변환
function sendDiscordNotification(embed) {
    let msg = `<b>${embed.title || ''}</b>\n\n`;
    if (embed.fields) {
        embed.fields.forEach(f => {
            msg += `<b>${f.name}:</b> ${f.value}\n`;
        });
    }
    msg += `\n— 부고문자무료발송`;
    sendTelegramNotification(msg);
}

// ===== 스텝 이동 =====
function goToStep(step) {
    if (step === 2) {
        if (!validateStep1()) return;
        generatePreview();
    }
    if (step === 3) {
        generateShareData();
    }

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');

    document.querySelectorAll('.step').forEach(s => {
        const sStep = parseInt(s.dataset.step);
        s.classList.remove('active', 'done');
        if (sStep === step) s.classList.add('active');
        else if (sStep < step) s.classList.add('done');
    });

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 유효성 검사 =====
function validateStep1() {
    const name = document.getElementById('deceasedName').value.trim();
    const hall = document.getElementById('funeralHall').value.trim();
    const date = document.getElementById('funeralDate').value;
    const mourners = getMourners();

    if (!name) {
        showToast('고인 성함을 입력해 주세요');
        document.getElementById('deceasedName').focus();
        return false;
    }
    if (mourners.length === 0 || !mourners[0].name) {
        showToast('상주 정보를 입력해 주세요');
        return false;
    }
    if (!hall) {
        showToast('빈소를 입력해 주세요');
        document.getElementById('funeralHall').focus();
        return false;
    }
    if (!date) {
        showToast('발인 날짜를 선택해 주세요');
        document.getElementById('funeralDate').focus();
        return false;
    }
    return true;
}

// ===== 상주 관리 =====
function getMourners() {
    const items = document.querySelectorAll('.mourner-item');
    const mourners = [];
    items.forEach(item => {
        let relation = item.querySelector('.mournerRelation').value;
        const customInput = item.querySelector('.mournerRelationCustom');
        if (relation === '__custom__' && customInput) {
            relation = customInput.value.trim();
        }
        const name = item.querySelector('.mournerName').value.trim();
        if (name) {
            mourners.push({ relation, name });
        }
    });
    return mourners;
}

function addMourner() {
    const list = document.getElementById('chiefMournerList');
    const item = document.createElement('div');
    item.className = 'mourner-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>관계</label>
                <select class="mournerRelation" onchange="toggleCustomRelation(this)">
                    <option value="">선택</option>
                    <option value="장남">장남</option>
                    <option value="차남">차남</option>
                    <option value="장녀">장녀</option>
                    <option value="차녀">차녀</option>
                    <option value="배우자">배우자</option>
                    <option value="아들">아들</option>
                    <option value="딸">딸</option>
                    <option value="손자">손자</option>
                    <option value="손녀">손녀</option>
                    <option value="형제">형제</option>
                    <option value="자매">자매</option>
                    <option value="기타">기타</option>
                    <option value="__custom__">직접입력</option>
                </select>
                <input type="text" class="mournerRelationCustom" placeholder="관계를 직접 입력하세요" style="display:none; margin-top:6px;">
            </div>
            <div class="form-group">
                <label>성함</label>
                <input type="text" class="mournerName" placeholder="예: 홍영희">
            </div>
        </div>
        <button type="button" class="remove-btn" onclick="removeMourner(this)">삭제</button>
    `;
    list.appendChild(item);
}

function removeMourner(btn) {
    btn.closest('.mourner-item').remove();
}

// 직접입력 토글
function toggleCustomRelation(selectEl) {
    const customInput = selectEl.parentElement.querySelector('.mournerRelationCustom');
    if (selectEl.value === '__custom__') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
        customInput.value = '';
    }
}

// ===== 계좌 관리 =====
function getAccounts() {
    const items = document.querySelectorAll('.account-item');
    const accounts = [];
    items.forEach(item => {
        const bank = item.querySelector('.accountBank').value;
        const holder = item.querySelector('.accountHolder').value.trim();
        const number = item.querySelector('.accountNumber').value.trim();
        if (bank && holder && number) {
            accounts.push({ bank, holder, number });
        }
    });
    return accounts;
}

function addAccount() {
    const list = document.getElementById('accountList');
    const item = document.createElement('div');
    item.className = 'account-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>은행</label>
                <select class="accountBank">
                    <option value="">선택</option>
                    <option value="국민은행">국민은행</option>
                    <option value="신한은행">신한은행</option>
                    <option value="하나은행">하나은행</option>
                    <option value="우리은행">우리은행</option>
                    <option value="NH농협">NH농협</option>
                    <option value="IBK기업">IBK기업</option>
                    <option value="카카오뱅크">카카오뱅크</option>
                    <option value="토스뱅크">토스뱅크</option>
                    <option value="케이뱅크">케이뱅크</option>
                    <option value="SC제일">SC제일</option>
                    <option value="대구은행">대구은행</option>
                    <option value="부산은행">부산은행</option>
                    <option value="광주은행">광주은행</option>
                    <option value="경남은행">경남은행</option>
                    <option value="전북은행">전북은행</option>
                    <option value="제주은행">제주은행</option>
                    <option value="수협은행">수협은행</option>
                    <option value="우체국">우체국</option>
                    <option value="새마을금고">새마을금고</option>
                    <option value="신협">신협</option>
                </select>
            </div>
            <div class="form-group">
                <label>예금주</label>
                <input type="text" class="accountHolder" placeholder="예: 홍길동 (선택)">
            </div>
        </div>
        <div class="form-group">
            <label>계좌번호</label>
            <input type="text" class="accountNumber" placeholder="예: 123-456-789012 (선택)">
        </div>
        <button type="button" class="remove-btn" onclick="removeAccount(this)">삭제</button>
    `;
    list.appendChild(item);
}

function removeAccount(btn) {
    btn.closest('.account-item').remove();
}

// ===== 데이터 수집 =====
function getFormData() {
    return {
        deceasedName: document.getElementById('deceasedName').value.trim(),
        deceasedTerm: document.getElementById('deceasedTerm').value,
        deceasedAge: document.getElementById('deceasedAge').value,
        deceasedGender: document.getElementById('deceasedGender').value,
        mourners: getMourners(),
        funeralHall: document.getElementById('funeralHall').value.trim(),
        funeralRoom: document.getElementById('funeralRoom').value.trim(),
        funeralDate: document.getElementById('funeralDate').value,
        funeralTime: document.getElementById('funeralTime').value,
        funeralPlace: document.getElementById('funeralPlace').value.trim(),
        funeralHallAddress: document.getElementById('funeralHallAddress').value.trim(),
        funeralHallPhone: document.getElementById('funeralHallPhone').value.trim(),
        messageStyle: document.getElementById('messageStyle').value,
        additionalMessage: document.getElementById('additionalMessage').value.trim(),
        accounts: getAccounts(),
    };
}

// ===== 날짜/시간 포맷 =====
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[d.getDay()];
    return `${year}년 ${month}월 ${day}일(${weekDay})`;
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}시${m !== '00' ? ` ${m}분` : ''}`;
}

// ===== 부고 메시지 생성 =====
function generateMessage(data, style) {
    const mournerText = data.mourners.map(m =>
        m.relation ? `${m.relation} ${m.name}` : m.name
    ).join(', ');

    const term = data.deceasedTerm || '별세';
    const termVerb = {
        '별세': '별세하셨기에',
        '영면': '영면하셨기에',
        '소천': '소천하셨기에',
        '선종': '선종하셨기에',
        '입적': '입적하셨기에',
        '열반': '열반하셨기에',
    }[term] || '별세하셨기에';

    const ageText = data.deceasedAge ? ` (향년 ${data.deceasedAge}세)` : '';
    const roomText = data.funeralRoom ? ` ${data.funeralRoom}` : '';
    const timeText = data.funeralTime ? ` ${formatTime(data.funeralTime)}` : '';
    const placeText = data.funeralPlace ? `\n장  지: ${data.funeralPlace}` : '';
    const addressText = data.funeralHallAddress ? `\n주  소: ${data.funeralHallAddress}` : '';
    const phoneText = data.funeralHallPhone ? `\n연락처: ${data.funeralHallPhone}` : '';
    const accountText = data.accounts && data.accounts.length > 0
        ? '\n\n[마음 전하는 곳]\n' + data.accounts.map(a => `${a.bank} ${a.number} (${a.holder})`).join('\n')
        : '';

    if (style === 'formal') {
        return `[부 고]

${data.deceasedName}님께서${ageText} ${termVerb} 삼가 알려드립니다.

상  주: ${mournerText}

빈  소: ${data.funeralHall}${roomText}
발  인: ${formatDate(data.funeralDate)}${timeText}${placeText}${addressText}${phoneText}

깊은 슬픔 속에 알려드리오니
고인의 명복을 빌어주시면 감사하겠습니다.${data.additionalMessage ? '\n\n' + data.additionalMessage : ''}${accountText}`;
    }

    if (style === 'semi') {
        return `[부고 알림]

${data.deceasedName}님${ageText}의 ${term} 소식을 알려드립니다.

상주: ${mournerText}

빈소: ${data.funeralHall}${roomText}
발인: ${formatDate(data.funeralDate)}${timeText}${placeText}${addressText}${phoneText}

삼가 고인의 명복을 빕니다.${data.additionalMessage ? '\n\n' + data.additionalMessage : ''}${accountText}`;
    }

    // simple
    return `[부고] ${data.deceasedName}님${ageText} ${term}
상주: ${mournerText}
빈소: ${data.funeralHall}${roomText}
발인: ${formatDate(data.funeralDate)}${timeText}${placeText ? '\n장지: ' + data.funeralPlace : ''}${data.additionalMessage ? '\n' + data.additionalMessage : ''}${accountText}`;
}

// ===== 미리보기 생성 =====
function generatePreview() {
    const data = getFormData();
    const message = generateMessage(data, data.messageStyle);

    // 카드 미리보기
    const previewHTML = generatePreviewHTML(data);
    document.getElementById('previewContent').innerHTML = previewHTML;

    // SMS 미리보기
    document.getElementById('smsPreview').textContent = message;
}

function generatePreviewHTML(data) {
    const mournerText = data.mourners.map(m =>
        m.relation ? `<strong>${m.relation}</strong> ${m.name}` : m.name
    ).join('\n');

    const ageText = data.deceasedAge ? ` (향년 ${data.deceasedAge}세)` : '';
    const roomText = data.funeralRoom ? ` ${data.funeralRoom}` : '';
    const timeText = data.funeralTime ? ` ${formatTime(data.funeralTime)}` : '';

    const term = data.deceasedTerm || '별세';

    let html = `<div style="text-align:center; margin-bottom:16px;">
<div style="font-size:17px; font-weight:700; color:var(--primary); margin-bottom:2px;">${data.deceasedName}님${ageText}</div>
<div style="font-size:15px; font-weight:600; color:var(--primary);">${term}를 알려드립니다.</div>
</div>

<div style="padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 12px 0;">
<strong>상  주</strong>
${mournerText}
</div>

<div style="padding: 8px 0;">
<strong>빈  소</strong>  ${data.funeralHall}${roomText}
<strong>발  인</strong>  ${formatDate(data.funeralDate)}${timeText}`;

    if (data.funeralPlace) {
        html += `\n<strong>장  지</strong>  ${data.funeralPlace}`;
    }
    if (data.funeralHallAddress) {
        html += `\n<strong>주  소</strong>  ${data.funeralHallAddress}`;
    }
    if (data.funeralHallPhone) {
        html += `\n<strong>연락처</strong>  ${data.funeralHallPhone}`;
    }

    html += `</div>`;

    if (data.additionalMessage) {
        html += `\n<div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border); font-size:13px; color:var(--text-light);">${data.additionalMessage}</div>`;
    }

    if (data.accounts && data.accounts.length > 0) {
        html += `\n<div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
<strong>마음 전하는 곳</strong>
${data.accounts.map(a => `${a.bank} ${a.number} (${a.holder})`).join('\n')}</div>`;
    }

    return html;
}

// ===== 공유 데이터 생성 =====
async function generateShareData() {
    const data = getFormData();
    const baseUrl = window.location.origin + window.location.pathname;

    // Firebase에 저장 시도
    if (typeof saveFuneralData === 'function') {
        const shortId = await saveFuneralData(data);
        if (shortId) {
            const shareUrl = `${baseUrl}?id=${shortId}`;
            document.getElementById('shareUrl').value = shareUrl;
            generateQR(shareUrl);

            // Discord 알림 - 부고 생성
            const mournerText = data.mourners.map(m => m.relation ? `${m.relation} ${m.name}` : m.name).join(', ');
            sendDiscordNotification({
                title: '📋 새 부고 등록',
                color: 0x2c2c3e,
                fields: [
                    { name: '고인', value: `${data.deceasedName} ${data.deceasedAge ? '(향년 ' + data.deceasedAge + '세)' : ''}`, inline: true },
                    { name: '임종', value: data.deceasedTerm || '별세', inline: true },
                    { name: '상주', value: mournerText || '-' },
                    { name: '빈소', value: `${data.funeralHall} ${data.funeralRoom || ''}`, inline: true },
                    { name: '발인', value: data.funeralDate || '-', inline: true },
                    { name: '부고 링크', value: shareUrl }
                ],
                footer: { text: '부고문자무료발송' },
                timestamp: new Date().toISOString()
            });

            if (navigator.share) {
                document.getElementById('nativeShareBtn').style.display = 'flex';
            }
            return;
        }
    }

    // Firebase 실패 시 기존 방식 (URL 해시)
    const encoded = encodeFormData(data);
    const shareUrl = `${baseUrl}#funeral=${encoded}`;
    document.getElementById('shareUrl').value = shareUrl;
    generateQR(shareUrl);

    if (navigator.share) {
        document.getElementById('nativeShareBtn').style.display = 'flex';
    }
}

function encodeFormData(data) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeFormData(encoded) {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
}

// ===== QR 코드 생성 (간단한 캔버스 기반) =====
function generateQR(url) {
    const container = document.getElementById('qrCode');
    container.innerHTML = '';

    // QR 코드 라이브러리 없이 간단한 안내
    const div = document.createElement('div');
    div.style.cssText = 'padding:20px; text-align:center; color:var(--text-light); font-size:13px;';
    div.innerHTML = `
        <div style="width:160px; height:160px; margin:0 auto 12px; background:#f0f0f0; border-radius:12px; display:flex; align-items:center; justify-content:center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}"
                 alt="QR코드" width="140" height="140" style="border-radius:8px;"
                 onerror="this.parentElement.innerHTML='<span style=font-size:40px>📱</span><br><span style=font-size:11px>QR 생성 불가</span>'">
        </div>
        <p>QR코드를 스캔하면 부고 페이지로 이동합니다</p>
    `;
    container.appendChild(div);
}

// ===== 공유 기능 =====
function getShareMessage() {
    const data = getFormData();
    return generateMessage(data, data.messageStyle);
}

function shareKakao() {
    const message = getShareMessage();
    // 카카오톡 공유 - 모바일에서 카카오톡 URL 스킴 사용
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(document.getElementById('shareUrl').value)}&text=${encodeURIComponent(message)}`;

    // 모바일 기기 감지
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
        // 카카오톡 앱 스킴 시도
        const textToShare = getShareMessage();
        const url = `kakaotalk://msg/text/${encodeURIComponent(textToShare)}`;

        // 직접 텍스트 공유 시도
        if (navigator.share) {
            navigator.share({
                title: '부고 알림',
                text: textToShare,
            }).catch(() => {
                // 실패 시 클립보드 복사
                copyToClipboard(textToShare);
                showToast('카카오톡에 붙여넣기 해주세요');
            });
        } else {
            copyToClipboard(textToShare);
            showToast('내용이 복사되었습니다. 카카오톡에 붙여넣기 해주세요');
        }
    } else {
        // PC - 클립보드 복사 후 안내
        copyToClipboard(getShareMessage());
        showToast('내용이 복사되었습니다. 카카오톡에 붙여넣기 해주세요');
    }
}

function shareSMS() {
    const message = getShareMessage();
    const shareUrl = document.getElementById('shareUrl').value;
    const fullMessage = message + '\n\n▶ 부고 페이지: ' + shareUrl;

    // SMS URL 스킴
    const smsUrl = /iPhone|iPad/i.test(navigator.userAgent)
        ? `sms:&body=${encodeURIComponent(fullMessage)}`
        : `sms:?body=${encodeURIComponent(fullMessage)}`;

    window.location.href = smsUrl;
}

function copyMessage() {
    const message = getShareMessage();
    const shareUrl = document.getElementById('shareUrl').value;
    copyToClipboard(message + '\n\n▶ 부고 페이지: ' + shareUrl);
    showToast('부고 문자가 복사되었습니다');
}

function shareLink() {
    const shareUrl = document.getElementById('shareUrl').value;
    copyToClipboard(shareUrl);
    showToast('링크가 복사되었습니다');
}

function copyLink() {
    const shareUrl = document.getElementById('shareUrl').value;
    copyToClipboard(shareUrl);
    showToast('링크가 복사되었습니다');
}

function shareNative() {
    const message = getShareMessage();
    const shareUrl = document.getElementById('shareUrl').value;

    navigator.share({
        title: '부고 알림',
        text: message,
        url: shareUrl,
    }).catch(() => {});
}

// ===== 클립보드 복사 =====
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

// ===== 토스트 =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== 폼 초기화 =====
function resetForm() {
    document.getElementById('deceasedName').value = '';
    document.getElementById('deceasedTerm').value = '별세';
    document.getElementById('deceasedAge').value = '';
    document.getElementById('deceasedGender').value = '';
    document.getElementById('funeralHall').value = '';
    document.getElementById('funeralRoom').value = '';
    document.getElementById('funeralDate').value = '';
    document.getElementById('funeralTime').value = '07:00';
    document.getElementById('funeralPlace').value = '';
    document.getElementById('funeralHallAddress').value = '';
    document.getElementById('funeralHallPhone').value = '';
    document.getElementById('messageStyle').value = 'formal';
    document.getElementById('additionalMessage').value = '';

    // 상주 초기화
    const list = document.getElementById('chiefMournerList');
    list.innerHTML = `
        <div class="mourner-item">
            <div class="form-row">
                <div class="form-group">
                    <label>관계 <span class="required">*</span></label>
                    <select class="mournerRelation" onchange="toggleCustomRelation(this)">
                        <option value="">선택</option>
                        <option value="장남">장남</option>
                        <option value="차남">차남</option>
                        <option value="장녀">장녀</option>
                        <option value="차녀">차녀</option>
                        <option value="배우자">배우자</option>
                        <option value="아들">아들</option>
                        <option value="딸">딸</option>
                        <option value="손자">손자</option>
                        <option value="손녀">손녀</option>
                        <option value="형제">형제</option>
                        <option value="자매">자매</option>
                        <option value="기타">기타</option>
                        <option value="__custom__">직접입력</option>
                    </select>
                    <input type="text" class="mournerRelationCustom" placeholder="관계를 직접 입력하세요" style="display:none; margin-top:6px;">
                </div>
                <div class="form-group">
                    <label>성함 <span class="required">*</span></label>
                    <input type="text" class="mournerName" placeholder="예: 홍영희">
                </div>
            </div>
        </div>
    `;

    // 계좌 초기화
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = `
        <div class="account-item">
            <div class="form-row">
                <div class="form-group">
                    <label>은행</label>
                    <select class="accountBank">
                        <option value="">선택</option>
                        <option value="국민은행">국민은행</option>
                        <option value="신한은행">신한은행</option>
                        <option value="하나은행">하나은행</option>
                        <option value="우리은행">우리은행</option>
                        <option value="NH농협">NH농협</option>
                        <option value="IBK기업">IBK기업</option>
                        <option value="카카오뱅크">카카오뱅크</option>
                        <option value="토스뱅크">토스뱅크</option>
                        <option value="케이뱅크">케이뱅크</option>
                        <option value="SC제일">SC제일</option>
                        <option value="대구은행">대구은행</option>
                        <option value="부산은행">부산은행</option>
                        <option value="광주은행">광주은행</option>
                        <option value="경남은행">경남은행</option>
                        <option value="전북은행">전북은행</option>
                        <option value="제주은행">제주은행</option>
                        <option value="수협은행">수협은행</option>
                        <option value="우체국">우체국</option>
                        <option value="새마을금고">새마을금고</option>
                        <option value="신협">신협</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>예금주</label>
                    <input type="text" class="accountHolder" placeholder="예: 홍길동 (선택)">
                </div>
            </div>
            <div class="form-group">
                <label>���좌번호</label>
                <input type="text" class="accountNumber" placeholder="예: 123-456-789012 (선택)">
            </div>
        </div>
    `;

    goToStep(1);
    showToast('초기화되었습니다');
}

// ===== 부고 페이지 렌더링 (공유 링크 열었을 때) =====
function renderFuneralPage(data) {
    // 메인 앱 전체 숨기기
    document.querySelector('.header').style.display = 'none';
    document.querySelector('.step-indicator').style.display = 'none';
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';

    const page = document.getElementById('funeralPage');
    page.style.display = 'block';
    page.classList.add('active');

    const mournerText = data.mourners.map(m =>
        m.relation ? `${m.relation}  ${m.name}` : m.name
    ).join('\n');

    const ageText = data.deceasedAge ? `(향년 ${data.deceasedAge}세)` : '';
    const roomText = data.funeralRoom ? ` ${data.funeralRoom}` : '';
    const timeText = data.funeralTime ? ` ${formatTime(data.funeralTime)}` : '';

    const term = data.deceasedTerm || '별세';

    let body = `<div class="fp-deceased-name">${data.deceasedName}님 ${ageText}</div>
<div class="fp-deceased-term">${term}를 알려드립니다.</div>

━━━

상 주
${mournerText}

━━━

빈 소
${data.funeralHall}${roomText}

발 인
${formatDate(data.funeralDate)}${timeText}`;

    if (data.funeralPlace) {
        body += `\n\n장 지\n${data.funeralPlace}`;
    }
    if (data.funeralHallAddress) {
        body += `\n\n주 소\n${data.funeralHallAddress}`;
    }
    if (data.funeralHallPhone) {
        body += `\n\n연 락 처\n${data.funeralHallPhone}`;
    }
    if (data.additionalMessage) {
        body += `\n\n━━━\n\n${data.additionalMessage}`;
    }
    if (data.accounts && data.accounts.length > 0) {
        body += `\n\n━━━\n\n마음 전하는 곳\n\n${data.accounts.map(a => `${a.bank} ${a.number}\n(${a.holder})`).join('\n\n')}`;
    }

    document.getElementById('fpBody').innerHTML = body;

    // 지도 & 길찾기 버튼
    if (data.funeralHallAddress) {
        // 지도 표시
        const mapContainer = document.getElementById('fpMap');
        const query = encodeURIComponent(data.funeralHallAddress);
        mapContainer.innerHTML = `
            <iframe
                src="https://maps.google.com/maps?q=${query}&output=embed&hl=ko"
                width="100%"
                height="250"
                style="border:0; border-radius:12px;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            <div class="fp-address-row">
                <span class="fp-address-text">${data.funeralHallAddress}</span>
                <button class="fp-copy-addr-btn" onclick="copyToClipboard('${data.funeralHallAddress.replace(/'/g, "\\'")}'); showToast('주소가 복사되었습니다');">주소복사</button>
            </div>
        `;

        // 길찾기 버튼
        const navBtns = document.getElementById('fpNavBtns');
        navBtns.style.display = 'flex';

        document.getElementById('fpNavBtnKakao').onclick = () => {
            window.open(`https://map.kakao.com/link/search/${encodeURIComponent(data.funeralHallAddress)}`, '_blank');
        };

        document.getElementById('fpNavBtnNaver').onclick = () => {
            window.open(`https://map.naver.com/v5/search/${encodeURIComponent(data.funeralHallAddress)}`, '_blank');
        };
    }

    // 부고 데이터 저장
    currentFuneralData = data;

    // 조문 메시지 섹션 표시
    const condolenceSection = document.getElementById('fpCondolenceSection');
    condolenceSection.style.display = 'block';
    currentFuneralId = getFuneralId();
    loadCondolences();

    // 화환 섹션 표시
    const wreathSection = document.getElementById('fpWreathSection');
    wreathSection.style.display = 'block';
    loadWreathSenders();
}

// ===== 현재 부고 ID 가져오기 =====
let currentFuneralId = null;
let currentFuneralData = null;

function getFuneralId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || window.location.hash.replace('#funeral=', '').substring(0, 10);
}

// ===== 조문 메시지 =====
async function loadCondolences() {
    if (!currentFuneralId || typeof db === 'undefined') return;

    const listEl = document.getElementById('fpCondolenceList');

    try {
        const snapshot = await db.collection('funerals').doc(currentFuneralId)
            .collection('condolences')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        if (snapshot.empty) {
            listEl.innerHTML = '<div class="fp-condolence-empty">아직 조문 메시지가 없습니다.</div>';
            return;
        }

        listEl.innerHTML = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            const time = d.createdAt ? formatCondolenceTime(d.createdAt.toDate()) : '';
            const item = document.createElement('div');
            item.className = 'fp-condolence-item';
            item.innerHTML = `
                <div class="name">${escapeHtml(d.name)}</div>
                <div class="msg">${escapeHtml(d.message)}</div>
                <div class="time">${time}</div>
            `;
            listEl.appendChild(item);
        });
    } catch (error) {
        listEl.innerHTML = '<div class="fp-condolence-empty">메시지를 불러올 수 없습니다.</div>';
    }
}

function formatCondolenceTime(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${m}/${d} ${h}:${min}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function submitCondolence() {
    const name = document.getElementById('fpCondolenceName').value.trim();
    const message = document.getElementById('fpCondolenceMsg').value.trim();

    if (!name) { showToast('이름을 입력해 주세요'); return; }
    if (!message) { showToast('메시지를 입력해 주세요'); return; }
    if (!currentFuneralId || typeof db === 'undefined') {
        showToast('메시지를 저장할 수 없습니다');
        return;
    }

    try {
        await db.collection('funerals').doc(currentFuneralId)
            .collection('condolences')
            .add({
                name: name,
                message: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Discord 알림 - 조문 메시지
        sendDiscordNotification({
            title: '💐 조문 메시지',
            color: 0x8b7355,
            fields: [
                { name: '이름', value: name, inline: true },
                { name: '메시지', value: message },
                { name: '부고 ID', value: currentFuneralId || '-' }
            ],
            footer: { text: '부고문자무료발송' },
            timestamp: new Date().toISOString()
        });

        document.getElementById('fpCondolenceName').value = '';
        document.getElementById('fpCondolenceMsg').value = '';
        showToast('조문 메시지가 등록되었습니다');
        loadCondolences();
    } catch (error) {
        showToast('등록에 실패했습니다. 다시 시도해 주세요');
    }
}

// ===== 근조화환 =====
let selectedWreath = null;
let selectedWreathPrice = null;

function openWreathModal() {
    document.getElementById('wreathModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    selectedWreath = null;
    document.querySelectorAll('.wreath-item').forEach(i => i.classList.remove('selected'));
    document.getElementById('wreathForm').style.display = 'none';
}

function closeWreathModal() {
    document.getElementById('wreathModal').style.display = 'none';
    document.body.style.overflow = '';
}

function selectWreath(el, name, price) {
    document.querySelectorAll('.wreath-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedWreath = name;
    selectedWreathPrice = price;

    const priceText = price ? price.toLocaleString() + '원' : '';
    document.getElementById('wreathSelectedInfo').textContent = `선택: ${name} / ${priceText}`;
    document.getElementById('wreathPaymentAmount').textContent = `결제 금액: ${priceText}`;
    document.getElementById('wreathForm').style.display = 'block';

    // 배송지 정보 자동 채우기
    if (currentFuneralData) {
        document.getElementById('wreathDeliveryHall').value = (currentFuneralData.funeralHall || '') + ' ' + (currentFuneralData.funeralRoom || '');
        document.getElementById('wreathDeliveryAddr').value = currentFuneralData.funeralHallAddress || '';
    }

    document.getElementById('wreathForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 리본 추천 토글
function toggleRibbonSuggest() {
    const list = document.getElementById('ribbonSuggestList');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
}

function selectRibbon(text) {
    document.getElementById('wreathRibbonTop').value = text;
    document.getElementById('ribbonSuggestList').style.display = 'none';
}

// 증빙서류 토글
function toggleReceipt(type) {
    document.getElementById('receiptCash').style.display = type === 'cash' ? 'block' : 'none';
    document.getElementById('receiptTax').style.display = type === 'tax' ? 'block' : 'none';
}

async function submitWreath() {
    const receiverName = document.getElementById('wreathSenderName').value.trim();
    const receiverPhone = document.getElementById('wreathSenderPhone').value.trim();
    const orderName = document.getElementById('wreathOrderName').value.trim();
    const orderPhone = document.getElementById('wreathOrderPhone').value.trim();
    const ribbonTop = document.getElementById('wreathRibbonTop').value.trim();
    const fromName = document.getElementById('wreathFromName').value.trim();
    const agree = document.getElementById('wreathAgree').checked;

    const ribbon = ribbonTop || '삼가 고인의 명복을 빕니다';

    if (!selectedWreath) { showToast('화환을 선택해 주세요'); return; }
    if (!orderName) { showToast('주문자 성함을 입력해 주세요'); return; }
    if (!receiverName) { showToast('받는분 성함을 입력해 주세요'); return; }
    if (!receiverPhone) { showToast('받는분 연락처를 입력해 주세요'); return; }
    if (!fromName) { showToast('보내는 분을 입력해 주세요'); return; }
    if (!agree) { showToast('개인정보 수집 및 이용에 동의해 주세요'); return; }

    if (!currentFuneralId || typeof db === 'undefined') {
        showToast('접수할 수 없습니다');
        return;
    }

    // 증빙서류 정보
    const receiptType = document.querySelector('input[name="receipt"]:checked').value;
    let receiptInfo = { type: receiptType };
    if (receiptType === 'cash') {
        receiptInfo.phone = document.getElementById('receiptPhone').value.trim();
    } else if (receiptType === 'tax') {
        receiptInfo.company = document.getElementById('taxCompany').value.trim();
        receiptInfo.bizNo = document.getElementById('taxBizNo').value.trim();
    }

    try {
        await db.collection('funerals').doc(currentFuneralId)
            .collection('wreaths')
            .add({
                wreath: selectedWreath,
                price: selectedWreathPrice,
                orderName: orderName,
                orderPhone: orderPhone,
                senderName: receiverName,
                senderPhone: receiverPhone,
                ribbon: ribbon,
                fromName: fromName,
                receipt: receiptInfo,
                deliveryHall: document.getElementById('wreathDeliveryHall').value,
                deliveryAddr: document.getElementById('wreathDeliveryAddr').value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // 텔레그램 알림 - 화환 접수
        sendDiscordNotification({
            title: '화환 주문 접수',
            color: 0x8b5e3c,
            fields: [
                { name: '화환', value: selectedWreath, inline: true },
                { name: '금액', value: selectedWreathPrice ? selectedWreathPrice.toLocaleString() + '원' : '-', inline: true },
                { name: '주문자', value: orderName || '-', inline: true },
                { name: '주문자 연락처', value: orderPhone || '-', inline: true },
                { name: '받는분', value: receiverName, inline: true },
                { name: '받는분 연락처', value: receiverPhone, inline: true },
                { name: '리본 문구', value: ribbon },
                { name: '보내는 분', value: fromName || '-' },
                { name: '배송지', value: document.getElementById('wreathDeliveryHall').value || '-' },
                { name: '증빙', value: receiptType === 'none' ? '신청안함' : receiptType },
                { name: '부고 ID', value: currentFuneralId || '-' }
            ],
            footer: { text: '부고문자무료발송' },
            timestamp: new Date().toISOString()
        });

        showToast('주문이 완료되었습니다');
        closeWreathModal();
        // 폼 초기화
        document.getElementById('wreathOrderName').value = '';
        document.getElementById('wreathOrderPhone').value = '';
        document.getElementById('wreathSenderName').value = '';
        document.getElementById('wreathSenderPhone').value = '';
        document.getElementById('wreathRibbonTop').value = '';
        document.getElementById('wreathFromName').value = '';
        document.getElementById('wreathAgree').checked = false;
        loadWreathSenders();
    } catch (error) {
        showToast('접수에 실패했습니다. 다시 시도해 주세요');
    }
}

// ===== 화환 보내신 분 목록 =====
async function loadWreathSenders() {
    if (!currentFuneralId || typeof db === 'undefined') return;

    const listEl = document.getElementById('fpWreathSenderList');

    try {
        const snapshot = await db.collection('funerals').doc(currentFuneralId)
            .collection('wreaths')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            listEl.innerHTML = '';
            return;
        }

        let html = '<div class="fp-wreath-sender-title">근조화환 보내신 분</div>';

        snapshot.forEach(doc => {
            const d = doc.data();
            const date = d.createdAt ? formatCondolenceTime(d.createdAt.toDate()) : '';
            html += `
                <div class="fp-wreath-sender-item">
                    <div>
                        <div class="fp-wreath-sender-name">${escapeHtml(d.senderName)} - ${escapeHtml(d.wreath)}</div>
                        <div class="fp-wreath-sender-ribbon">${escapeHtml(d.ribbon || '삼가 고인의 명복을 빕니다')}</div>
                    </div>
                    <div class="fp-wreath-sender-date">${date}</div>
                </div>`;
        });

        listEl.innerHTML = html;
    } catch (e) {
        // 조용히 실패
    }
}

// ===== 답례장 =====
const replyTemplates = {
    general: `삼가 인사드립니다.
바쁘신 와중에도 장례에 참석하시어
따뜻한 위로와 조의를 베풀어 주신 데 대해
깊이 감사드립니다.
덕분에 무사히 장례를 마칠 수 있었습니다.
베풀어주신 마음 오래도록 잊지 않겠습니다.`,
    christian: `삼가 인사드립니다.
바쁘신 가운데에도 장례에 함께하시어
기도와 위로로 함께해 주심에 진심으로 감사드립니다.
하나님의 은혜 가운데 장례를 무사히 마칠 수 있었습니다.
베풀어주신 사랑과 위로를 오래도록 간직하겠습니다.`,
    catholic: `삼가 인사드립니다.
바쁘신 가운데에도 장례에 함께하시어
기도와 위로를 베풀어 주심에 진심으로 감사드립니다.
주님의 은총 안에서 장례를 무사히 마칠 수 있었습니다.
베풀어주신 정성과 사랑을 오래도록 간직하겠습니다.`,
    buddhist: `삼가 인사드립니다.
바쁘신 가운데 장례에 함께하시어
위로와 조의를 베풀어 주심에 깊이 감사드립니다.
고인의 극락왕생을 기원해 주신 덕분에
무사히 장례를 마칠 수 있었습니다.
베풀어주신 공덕 깊이 간직하겠습니다.`
};

let selectedReplyType = null;
let selectedReplyText = '';

function openReplyModal() {
    document.getElementById('replyModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    selectedReplyType = null;
    selectedReplyText = '';
    document.querySelectorAll('.reply-option').forEach(o => o.classList.remove('selected'));
    document.getElementById('replyPreview').style.display = 'none';
    document.getElementById('replyShareBtns').style.display = 'none';
}

function closeReplyModal() {
    document.getElementById('replyModal').style.display = 'none';
    document.body.style.overflow = '';
}

function selectReply(el, type) {
    document.querySelectorAll('.reply-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedReplyType = type;

    // 상주 정보 가져오기
    const data = getFormData();
    const mournerText = data.mourners.map(m =>
        m.relation ? `${m.relation} ${m.name}` : m.name
    ).join(', ');

    selectedReplyText = `[답례 인사]\n\n${replyTemplates[type]}\n\n상주 ${mournerText} 드림`;

    document.getElementById('replyPreviewText').value = selectedReplyText;
    document.getElementById('replyPreview').style.display = 'block';
    document.getElementById('replyShareBtns').style.display = 'block';

    if (navigator.share) {
        document.getElementById('replyNativeShareBtn').style.display = 'flex';
    }

    // QR 코드
    const baseUrl = window.location.origin + window.location.pathname;
    const replyUrl = `${baseUrl}#reply=${btoa(unescape(encodeURIComponent(selectedReplyText)))}`;
    const qrContainer = document.getElementById('replyQrCode');
    qrContainer.innerHTML = `
        <div style="width:160px; height:160px; margin:0 auto 12px; background:#f0f0f0; border-radius:12px; display:flex; align-items:center; justify-content:center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(replyUrl)}"
                 alt="QR코드" width="140" height="140" style="border-radius:8px;"
                 onerror="this.parentElement.innerHTML='<span style=font-size:40px>📱</span><br><span style=font-size:11px>QR 생성 불가</span>'">
        </div>
    `;

    document.getElementById('replyPreview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function shareReplyKakao() {
    if (navigator.share) {
        navigator.share({ title: '답례 인사', text: selectedReplyText }).catch(() => {
            copyToClipboard(selectedReplyText);
            showToast('내용이 복사되었습니다. 카카오톡에 붙여넣기 해주세요');
        });
    } else {
        copyToClipboard(selectedReplyText);
        showToast('내용이 복사되었습니다. 카카오톡에 붙여넣기 해주세요');
    }
}

function shareReplySMS() {
    const smsUrl = /iPhone|iPad/i.test(navigator.userAgent)
        ? `sms:&body=${encodeURIComponent(selectedReplyText)}`
        : `sms:?body=${encodeURIComponent(selectedReplyText)}`;
    window.location.href = smsUrl;
}

function copyReplyMessage() {
    copyToClipboard(selectedReplyText);
    showToast('답례장이 복사되었습니다');
}

function shareReplyLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const replyUrl = `${baseUrl}#reply=${btoa(unescape(encodeURIComponent(selectedReplyText)))}`;
    copyToClipboard(replyUrl);
    showToast('링크가 복사되었습니다');
}

function shareReplyNative() {
    navigator.share({ title: '답례 인사', text: selectedReplyText }).catch(() => {});
}

// ===== URL 체크 (공유 링크 처리) =====
async function checkUrl() {
    // 1. ?id= 파라미터 체크 (Firebase 짧은 URL)
    const params = new URLSearchParams(window.location.search);
    const shortId = params.get('id');
    if (shortId && typeof loadFuneralData === 'function') {
        try {
            const data = await loadFuneralData(shortId);
            if (data) {
                renderFuneralPage(data);
                return;
            } else {
                showToast('만료되었거나 존재하지 않는 부고입니다');
            }
        } catch (e) {
            console.error('부고 데이터 로드 오류:', e);
        }
    }

    // 2. #funeral= 해시 체크 (기존 방식 호환)
    const hash = window.location.hash;
    if (hash.startsWith('#funeral=')) {
        try {
            const encoded = hash.replace('#funeral=', '');
            const data = decodeFormData(encoded);
            renderFuneralPage(data);
        } catch (e) {
            console.error('부고 데이터 파싱 오류:', e);
        }
    }
}

// 기존 호환용
function checkHash() {
    checkUrl();
}

// ===== PWA 설치 프롬프트 =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    // 이미 표시했거나 닫았으면 무시
    if (sessionStorage.getItem('installDismissed')) return;

    const prompt = document.createElement('div');
    prompt.className = 'install-prompt';
    prompt.innerHTML = `
        <p>📱 홈 화면에 추가하면 앱처럼 사용할 수 있어요</p>
        <button class="btn-install" onclick="installPWA()">설치</button>
        <button class="btn-dismiss" onclick="dismissInstall(this)">&times;</button>
    `;
    document.body.appendChild(prompt);
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            const prompt = document.querySelector('.install-prompt');
            if (prompt) prompt.remove();
        });
    }
}

function dismissInstall(btn) {
    btn.closest('.install-prompt').remove();
    sessionStorage.setItem('installDismissed', 'true');
}

// ===== 서비스 워커 등록 =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// ===== 초기화 =====
window.addEventListener('load', () => {
    checkUrl();

    // 발인 날짜 기본값 설정
    document.getElementById('funeralDate').setAttribute('min', new Date().toISOString().split('T')[0]);

    // 만료 데이터 정리
    if (typeof cleanupExpired === 'function') {
        cleanupExpired();
    }
});

window.addEventListener('hashchange', () => checkUrl());
