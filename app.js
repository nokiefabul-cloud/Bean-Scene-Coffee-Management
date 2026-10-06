/* Bean Scene Coffee Co. — fully interactive vanilla JS front-end demo */
(() => {
  "use strict";

  const DB = {
    users: "bsc_users",
    employees: "bsc_employees",
    attendance: "bsc_attendance",
    schedules: "bsc_schedules",
    payroll: "bsc_payroll",
    notifications: "bsc_notifications",
    settings: "bsc_settings",
    session: "bsc_session",
    pendingOTP: "bsc_pending_otp",
    pendingLoginOTP: "bsc_pending_login_otp",
    pendingReset: "bsc_pending_reset",
    captcha: "bsc_captcha"
  };

  const SHIFT_OPTIONS = ["6AM–2PM","8AM–4PM","10AM–6PM","12PM–6PM","2PM–10PM","3PM–11PM","OFF"];
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  function get(key, fallback=[]) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function uid(prefix="ID") { return prefix + Math.random().toString(36).slice(2,8).toUpperCase() + Date.now().toString(36).slice(-3); }
  function escapeHtml(v="") {
    return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function initials(name="") { return name.split(/\s+/).filter(Boolean).map(x=>x[0]).join("").slice(0,2).toUpperCase(); }
  function money(n) { return "₱" + Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:0,maximumFractionDigits:0}); }
  function dateLabel() { return new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"}); }
  function todayISO() { return new Date().toISOString().slice(0,10); }
  function nowTime() { return new Date().toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit",hour12:false}); }
  function getSession() { return get(DB.session, null); }
  function saveSession(user) { set(DB.session, user ? {id:user.id, role:user.role} : null); }

  function applyTheme() {
    const s = get(DB.settings, {});
    const theme = s.theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  }

  function setTheme(theme) {
    const s = get(DB.settings, {});
    s.theme = theme === "dark" ? "dark" : "light";
    set(DB.settings, s);
    applyTheme();
    toast(s.theme === "dark" ? "Dark mode enabled." : "Light mode enabled.");
    settingsTab("appearance");
  }
  function currentUser() {
    const s = getSession();
    if (!s) return null;
    return get(DB.users, []).find(u => u.id === s.id) || null;
  }
  function employeeForUser(user) {
    return get(DB.employees, []).find(e => e.userId === user?.id || e.email === user?.email) || null;
  }
  function toast(message, type="success") {
    const root = $("#toast-root");
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    root.appendChild(el);
    setTimeout(()=>el.remove(), 3200);
  }

  function seed() {
    if (!localStorage.getItem(DB.users)) {
      const users = [
        {id:"USR001",firstName:"Maria",lastName:"Santos",name:"Maria Santos",email:"maria.santos@beanscene.ph",password:"Owner@123",role:"Owner",phone:"+63 917 123 4567",address:"12 Rizal Street, Makati City",hireDate:"2018-03-01"},
        {id:"USR002",firstName:"Jose",lastName:"Reyes",name:"Jose Reyes",email:"jose.reyes@beanscene.ph",password:"Manager@123",role:"Manager",phone:"+63 917 222 1111",address:"Makati City",hireDate:"2019-06-15"},
        {id:"USR003",firstName:"Ana",lastName:"Cruz",name:"Ana Cruz",email:"ana.cruz@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 345 6789",address:"56 Mabini St, Pasay City",hireDate:"2020-09-01"},
        {id:"USR004",firstName:"Carlos",lastName:"Dela Cruz",name:"Carlos Dela Cruz",email:"carlos.delacruz@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 456 7890",address:"Quezon City",hireDate:"2021-02-01"},
        {id:"USR005",firstName:"Rosa",lastName:"Mendoza",name:"Rosa Mendoza",email:"rosa.mendoza@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 567 8901",address:"Makati City",hireDate:"2021-05-10"},
        {id:"USR006",firstName:"Luis",lastName:"Garcia",name:"Luis Garcia",email:"luis.garcia@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 678 9012",address:"Taguig City",hireDate:"2022-01-12"},
        {id:"USR007",firstName:"Liza",lastName:"Ramos",name:"Liza Ramos",email:"liza.ramos@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 789 0123",address:"Pasay City",hireDate:"2022-08-20"},
        {id:"USR008",firstName:"Mark",lastName:"Reyes",name:"Mark Reyes",email:"mark.reyes@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 890 1234",address:"Manila City",hireDate:"2023-01-15"},
        {id:"USR009",firstName:"Sofia",lastName:"Garcia",name:"Sofia Garcia",email:"sofia.garcia@beanscene.ph",password:"Employee@123",role:"Employee",phone:"+63 919 901 2345",address:"Mandaluyong City",hireDate:"2023-04-18"}
      ];
      set(DB.users, users);
    }

    if (!localStorage.getItem(DB.employees)) {
      const users = get(DB.users);
      const data = [
        ["USR001","EMP001","Maria Santos","Owner / General Manager","Management","Owner",true,28000],
        ["USR002","EMP002","Jose Reyes","Store Manager","Operations","Manager",true,28000],
        ["USR003","EMP003","Ana Cruz","Senior Barista","Service","Employee",true,18000],
        ["USR004","EMP004","Carlos Dela Cruz","Barista","Service","Employee",true,16500],
        ["USR005","EMP005","Rosa Mendoza","Cashier","Service","Employee",true,15500],
        ["USR006","EMP006","Luis Garcia","Kitchen Staff","Kitchen","Employee",true,16000],
        ["USR007","EMP007","Liza Ramos","Part-time Barista","Service","Employee",false,10000],
        ["USR008","EMP008","Mark Reyes","Barista","Service","Employee",true,16500],
        ["USR009","EMP009","Sofia Garcia","Cashier","Service","Employee",true,15500]
      ];
      set(DB.employees, data.map((x,i)=>({id:x[1],userId:x[0],name:x[2],position:x[3],department:x[4],role:x[5],active:x[6],basicSalary:x[7],email:users.find(u=>u.id===x[0])?.email||"",phone:users.find(u=>u.id===x[0])?.phone||"",address:users.find(u=>u.id===x[0])?.address||"",hireDate:users.find(u=>u.id===x[0])?.hireDate||""})));
    }

    if (!localStorage.getItem(DB.attendance)) {
      const emps = get(DB.employees).filter(e=>e.role==="Employee");
      const seedRows = [
        [emps[0]?.id,"2024-01-15","08:02","17:05","Present"],
        [emps[0]?.id,"2024-01-16","08:15","17:00","Late"],
        [emps[0]?.id,"2024-01-17","07:58","19:30","Present"],
        [emps[1]?.id,"2024-01-29","08:45","","Late"],
        [emps[2]?.id,"2024-01-29","07:58","","Present"],
        [emps[3]?.id,"2024-01-29","","","Absent"],
        [emps[4]?.id,"2024-01-29","12:01","","Present"]
      ];
      set(DB.attendance, seedRows.map((r,i)=>({id:"ATT"+String(i+1).padStart(3,"0"),employeeId:r[0],date:r[1],timeIn:r[2],timeOut:r[3],status:r[4]})));
    }

    if (!localStorage.getItem(DB.schedules)) {
      const emps = get(DB.employees).filter(e=>e.role==="Employee");
      const patterns = [
        ["6AM–2PM","6AM–2PM","OFF","2PM–10PM","2PM–10PM","6AM–2PM","OFF"],
        ["2PM–10PM","OFF","6AM–2PM","6AM–2PM","OFF","10AM–6PM","10AM–6PM"],
        ["8AM–4PM","8AM–4PM","8AM–4PM","OFF","8AM–4PM","OFF","10AM–6PM"],
        ["7AM–3PM","7AM–3PM","3PM–11PM","3PM–11PM","OFF","7AM–3PM","OFF"],
        ["OFF","12PM–6PM","OFF","12PM–6PM","12PM–6PM","9AM–3PM","9AM–3PM"],
        ["10AM–6PM","10AM–6PM","OFF","2PM–10PM","2PM–10PM","10AM–6PM","OFF"],
        ["8AM–4PM","OFF","8AM–4PM","8AM–4PM","OFF","10AM–6PM","10AM–6PM"]
      ];
      set(DB.schedules, emps.map((e,i)=>({employeeId:e.id,week:"2024-01-22",days:Object.fromEntries(DAYS.map((d,j)=>[d,patterns[i%patterns.length][j]]))})));
    }

    if (!localStorage.getItem(DB.payroll)) {
      const emps = get(DB.employees).filter(e=>e.role==="Employee");
      set(DB.payroll, emps.map((e,i)=>({
        id:"PAY"+String(i+1).padStart(3,"0"), employeeId:e.id, period:"January 2024",
        basic:e.basicSalary, overtime:[1200,600,0,900,0,400,0][i]||0, allowances:[1000,700,500,800,400,600,500][i]||0,
        sss:[900,800,750,780,500,800,750][i]||0, philhealth:500, pagibig:200, tax:[300,250,220,250,100,240,200][i]||0, other:100,
        status:i===2?"Pending":"Paid"
      })));
    }

    if (!localStorage.getItem(DB.notifications)) {
      set(DB.notifications, [
        {id:"N001",role:"Employee",userId:"USR003",title:"Payslip Available",text:"Your January 2024 payslip is now available for download.",time:"2 hours ago",unread:true,icon:"₱"},
        {id:"N002",role:"Employee",userId:"USR003",title:"Attendance Alert",text:"You were marked absent on January 19, 2024. Please submit an explanation.",time:"1 day ago",unread:true,icon:"◷"},
        {id:"N003",role:"All",title:"Schedule Update",text:"Your schedule for next week has been updated by your manager.",time:"2 days ago",unread:false,icon:"▣"},
        {id:"N004",role:"All",title:"Overtime Approved",text:"Your overtime request for January 23 has been approved.",time:"3 days ago",unread:false,icon:"✓"},
        {id:"N005",role:"All",title:"Salary Credit",text:"Your December salary has been credited to your account.",time:"1 week ago",unread:false,icon:"₱"}
      ]);
    }
    if (!localStorage.getItem(DB.settings)) set(DB.settings,{businessName:"Bean Scene Coffee Co.",address:"123 Rizal Avenue, Makati City",phone:"+63 2 8XXX XXXX",email:"admin@beanscene.ph",emailNotifications:true,attendanceAlerts:true,theme:"light"});
  }

  function roleLabel(role){ return role==="Owner"?"Owner":role==="Manager"?"Manager":"Employee"; }
  function allowed(role, page){
    const ownerPages=["dashboard","employees","attendance","schedules","payroll","reports","notifications","settings"];
    const managerPages=["dashboard","employees","attendance","schedules","payroll","notifications"];
    const employeePages=["dashboard","profile","attendance","payroll","notifications"];
    return role==="Owner"?ownerPages.includes(page):role==="Manager"?managerPages.includes(page):employeePages.includes(page);
  }

  function navigate(page) {
    const user=currentUser();
    if (!user) { location.hash="#login"; render(); return; }
    if (!allowed(user.role,page)) {
      toast("Access denied. Redirected to your dashboard.","error");
      page="dashboard";
    }
    location.hash="#"+page;
  }

  function checkAuth() {
    const user=currentUser();
    const hash=location.hash.replace("#","") || "";
    if (!user && !["login","register","otp","login-otp","forgot","reset"].includes(hash)) { location.hash="#login"; return false; }
    if (user && ["login","register","otp","login-otp","forgot","reset"].includes(hash)) { location.hash="#dashboard"; return false; }
    return true;
  }

  function shell(content,page) {
    const user=currentUser();
    const role=user.role;
    const isOwner=role==="Owner", isManager=role==="Manager";
    let nav = isOwner
      ? [["dashboard","▦","Dashboard"],["employees","♙","Employees"],["attendance","◷","Attendance"],["schedules","▤","Schedules"],["payroll","₱","Payroll"],["reports","▥","Reports"],["notifications","♧","Notifications"],["settings","⚙","Settings"]]
      : isManager
      ? [["dashboard","▦","Dashboard"],["employees","♙","Employees"],["attendance","◷","Attendance"],["schedules","▤","Schedules"],["payroll","₱","Payroll"],["notifications","♧","Notifications"]]
      : [["dashboard","▦","Dashboard"],["profile","♙","My Profile"],["attendance","◷","My Attendance"],["payroll","▤","My Payroll"],["notifications","♧","Notifications"]];

    const unread = get(DB.notifications).filter(n=>(n.role==="All"||n.role===role||n.userId===user.id)&&n.unread).length;
    return `<div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene</strong><small>Coffee Co.</small></div></div>
        <div class="nav-section">${role.toUpperCase()} MENU</div>
        <nav class="nav">${nav.map(([p,ic,label])=>`<button class="nav-item ${page===p?"active":""}" data-nav="${p}"><span class="nav-icon">${ic}</span>${label}${p==="notifications"&&unread?`<span class="badge red" style="margin-left:auto">${unread}</span>`:""}</button>`).join("")}</nav>
        <div class="sidebar-user">
          <button class="user-button" id="profile-menu-button"><span class="avatar">${initials(user.name)}</span><span class="user-meta"><strong>${escapeHtml(user.name)}</strong><small>${roleLabel(role)}</small></span><span>⌄</span></button>
          <div class="profile-menu" id="profile-menu">
            ${role==="Employee"?`<button data-nav="profile">View Profile</button>`:""}
            <button id="sidebar-settings" ${role==="Employee"?"style='display:none'":""}>Settings</button>
            <button id="logout-btn" class="danger-text">↪ Sign Out</button>
          </div>
        </div>
      </aside>
      <main class="main">
        <div class="topbar"><button class="mobile-toggle" id="mobile-toggle">☰</button><span class="topbar-title">Coffee Shop Management System</span></div>
        ${content}
      </main>
    </div>`;
  }

  function pageHeader(title,subtitle,actions=""){return `<div class="page-header"><div><h1 class="page-title">${title}</h1><div class="page-subtitle">${subtitle||""}</div></div><div class="header-actions">${actions}</div></div>`;}

  function statsCard(icon,value,label,kind="",note=""){return `<div class="card stat-card"><div class="stat-icon ${kind}">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div>${note?`<div class="stat-note">${note}</div>`:""}</div>`;}

  function getTodayAttendance() {
    const att=get(DB.attendance), emps=get(DB.employees).filter(e=>e.role==="Employee");
    const today=todayISO();
    let rows=emps.map(e=>att.find(a=>a.employeeId===e.id&&a.date===today));
    if(!rows.some(Boolean)) rows=emps.map(e=>att.find(a=>a.employeeId===e.id&&a.date==="2024-01-29"));
    return rows.map(a=>a?{...a,employee:get(DB.employees).find(e=>e.id===a.employeeId)}:null).filter(Boolean);
  }

  function computePayroll(p) {
    const gross=Number(p.basic)+Number(p.overtime)+Number(p.allowances);
    const deductions=Number(p.sss)+Number(p.philhealth)+Number(p.pagibig)+Number(p.tax)+Number(p.other);
    return {...p,gross,deductions,net:gross-deductions};
  }

  function renderOwnerDashboard(){
    const emps=get(DB.employees).filter(e=>e.active&&e.role==="Employee");
    const today=getTodayAttendance();
    const present=today.filter(a=>a.status==="Present").length;
    const late=today.filter(a=>a.status==="Late").length;
    const absent=Math.max(0,emps.length-present-late);
    const payroll=get(DB.payroll).map(computePayroll).reduce((s,p)=>s+p.net,0);
    return shell(`<div class="page">
      ${pageHeader("Owner Dashboard",dateLabel(),`<button class="btn btn-primary" data-action="add-employee">＋ Add Employee</button>`)}
      <div class="grid grid-4">
        ${statsCard("♙",emps.length,"Total Employees","")}
        ${statsCard("✓",present,"Present Today","")}
        ${statsCard("×",absent,"Absent Today","red")}
        ${statsCard("!",late,"Late Today","gold")}
        ${statsCard("₱",money(payroll),"Monthly Payroll","blue","+2.4% vs last month")}
        ${statsCard("↗","₱318,000","Monthly Revenue","blue","January 2024")}
      </div>
      <div class="dashboard-two">
        <div class="card section-card"><div class="section-head"><div><h2 class="section-title">Weekly Hours</h2><span class="small muted">Jan 22–28, 2024</span></div></div>${weeklyChart()}</div>
        <div class="card section-card"><div class="section-head"><h2 class="section-title">Quick Actions</h2></div><div class="quick-list">
          <button class="quick" data-action="add-employee">Add Employee <span>›</span></button>
          <button class="quick" data-action="record-attendance">Record Attendance <span>›</span></button>
          <button class="quick" data-action="manage-schedule">Manage Schedule <span>›</span></button>
          <button class="quick" data-action="process-payroll">Process Payroll <span>›</span></button>
        </div></div>
      </div>
      <div class="dashboard-wide card section-card"><div class="section-head"><h2 class="section-title">Today's Attendance</h2><button class="link-btn" data-nav="attendance">Manage ›</button></div>${attendanceMiniTable()}</div>
    </div>`,"dashboard");
  }

  function renderManagerDashboard(){
    const today=getTodayAttendance();
    const present=today.filter(a=>a.status==="Present").length, late=today.filter(a=>a.status==="Late").length;
    const absent=Math.max(0,5-present-late);
    return shell(`<div class="page">
      ${pageHeader("Manager Dashboard","Monday, January 29, 2024")}
      <div class="grid grid-3">
        ${statsCard("♙",present,"Present Today","")}
        ${statsCard("×",absent,"Absent Today","red")}
        ${statsCard("!",late,"Late Arrivals","gold")}
      </div>
      <div class="dashboard-two">
        <div class="card section-card"><div class="section-head"><div><h2 class="section-title">Weekly Hours</h2><span class="small muted">Jan 22–28, 2024</span></div></div>${weeklyChart()}</div>
        <div class="card section-card"><div class="section-head"><h2 class="section-title">Quick Actions</h2></div><div class="quick-list">
          <button class="quick" data-action="record-attendance">Record Time In/Out <span>›</span></button>
          <button class="quick" data-action="mark-absence">Mark Absences <span>›</span></button>
          <button class="quick" data-action="approve-overtime">Approve Overtime <span>›</span></button>
          <button class="quick" data-action="manage-schedule">Edit Schedules <span>›</span></button>
        </div></div>
      </div>
      <div class="dashboard-wide card section-card"><div class="section-head"><h2 class="section-title">Today's Attendance</h2><button class="link-btn" data-nav="attendance">Manage ›</button></div>${attendanceMiniTable()}</div>
    </div>`,"dashboard");
  }

  function renderEmployeeDashboard(){
    const user=currentUser(), emp=employeeForUser(user), p=computePayroll(get(DB.payroll).find(x=>x.employeeId===emp?.id)||{basic:emp?.basicSalary||0,overtime:0,allowances:0,sss:0,philhealth:0,pagibig:0,tax:0,other:0});
    const hours=59.5, ot=5.8;
    return shell(`<div class="page">
      ${pageHeader(`Welcome, ${escapeHtml(user.firstName)}`,"Monday, January 29, 2024")}
      <div class="grid grid-4">
        ${statsCard("₱",money(p.basic),"Basic Salary","")}
        ${statsCard("↗",money(p.net),"Net Pay","")}
        ${statsCard("◷",hours+"h","Hours Worked","blue")}
        ${statsCard("◷",ot+"h","Overtime","gold")}
      </div>
      <div class="dashboard-two">
        <div class="card section-card"><div class="section-head"><h2 class="section-title">Attendance — January 2024</h2><button class="link-btn" data-nav="attendance">Details ›</button></div>${calendar()}</div>
        <div class="card section-card"><div class="section-head"><h2 class="section-title">January Payslip</h2><span class="badge green">SAMPLE</span></div>
          ${payslipSummary(p)}
          <div class="inline-actions" style="margin-top:15px"><button class="btn btn-secondary" data-action="view-payslip">View Payslip</button><button class="btn btn-primary" data-action="print-payslip">Print</button></div>
        </div>
      </div>
    </div>`,"dashboard");
  }

  function weeklyChart(){
    const vals=[44,40,47,42,37,29,15], alt=[5,0,8,3,0,0,0];
    return `<div class="chart"><div class="chart-grid"></div><div class="chart-bars">${vals.map((v,i)=>`<div class="bar-group"><div class="bar" style="height:${v*2}%"></div><div class="bar alt" style="height:${alt[i]*2}%"></div></div>`).join("")}</div><div class="bar-labels">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<span>${x}</span>`).join("")}</div></div>`;
  }
  function attendanceMiniTable(){
    const rows=getTodayAttendance();
    if(!rows.length) return `<div class="empty">No attendance records yet.</div>`;
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Position</th><th>Shift</th><th>Time In</th><th>Status</th></tr></thead><tbody>${rows.slice(0,7).map(a=>`<tr><td>${person(a.employee)}</td><td>${escapeHtml(a.employee.position)}</td><td>${getShift(a.employee.id,"Monday")}</td><td>${a.timeIn||"—"}</td><td>${statusBadge(a.status)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function person(e){return `<div class="person"><span class="avatar">${initials(e.name)}</span><span><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(e.id)}</small></span></div>`}
  function statusBadge(s){return `<span class="badge ${s==="Present"?"green":s==="Late"?"gold":"red"}">${s}</span>`}
  function getShift(empId,day){const s=get(DB.schedules).find(x=>x.employeeId===empId); return s?`<span class="shift ${shiftClass(s.days[day]||"OFF")}">${s.days[day]||"OFF"}</span>`:"—";}
  function shiftClass(s){return s==="OFF"?"off":s.startsWith("6")||s.startsWith("7")?"morning":s.startsWith("10")||s.startsWith("12")?"midday":"afternoon";}

  function renderEmployees(){
    const user=currentUser();
    let emps=get(DB.employees).filter(e=>e.role==="Employee");
    return shell(`<div class="page">
      ${pageHeader("Employees",`${emps.filter(e=>e.active).length} active employees`,currentUser().role==="Owner"?`<button class="btn btn-primary" data-action="add-employee">＋ Add Employee</button>`:"")}
      <div class="toolbar"><div class="search"><span>⌕</span><input id="employee-search" placeholder="Search employees..." autocomplete="off"></div><div class="filters"><button class="filter active" data-filter="all">All</button><button class="filter" data-filter="active">Active</button><button class="filter" data-filter="inactive">Inactive</button></div></div>
      <div id="employee-grid" class="employee-grid"></div>
    </div>`,"employees");
  }

  function renderEmployeeCards(filter="all",search=""){
    const root=$("#employee-grid"); if(!root)return;
    let emps=get(DB.employees).filter(e=>e.role==="Employee");
    if(filter==="active") emps=emps.filter(e=>e.active);
    if(filter==="inactive") emps=emps.filter(e=>!e.active);
    search=search.toLowerCase();
    if(search) emps=emps.filter(e=>[e.name,e.id,e.position,e.department,e.email].join(" ").toLowerCase().includes(search));
    root.innerHTML=emps.length?emps.map(e=>`<div class="card employee-card" data-employee="${e.id}">
      <div class="employee-top"><span class="avatar">${initials(e.name)}</span><div><strong>${escapeHtml(e.name)}</strong><div class="employee-id">${e.id}</div></div></div>
      <div class="employee-role">${escapeHtml(e.position)}</div><div class="employee-dept">${escapeHtml(e.department)}</div>
      <div class="employee-bottom"><span class="badge ${e.role==="Manager"?"green":"gold"}">${e.role}</span><span class="small ${e.active?"":"danger-text"}">${e.active?"♙ Active":"♙ Inactive"}</span></div>
    </div>`).join(""):`<div class="card empty" style="grid-column:1/-1">No employees match your search/filter.</div>`;
  }

  function renderAttendance(){
    const user=currentUser();
    let rows=getTodayAttendance();
    const isEmployee=user.role==="Employee";
    if(isEmployee){
      const emp=employeeForUser(user);
      rows=rows.filter(a=>a.employeeId===emp?.id);
    }
    const present=rows.filter(a=>a.status==="Present").length, late=rows.filter(a=>a.status==="Late").length, absent=rows.filter(a=>a.status==="Absent").length;
    const action=isEmployee?"":`<button class="btn btn-primary" data-action="record-attendance">＋ Record Attendance</button>`;
    return shell(`<div class="page">
      ${pageHeader(isEmployee?"My Attendance":"Attendance",isEmployee?"January 2024":"January 29, 2024 — Monday",action)}
      <div class="grid grid-3">${statsCard("✓",present,"Present Today","")}${statsCard("!",late,"Late Today","gold")}${statsCard("×",absent,"Absent Today","red")}</div>
      <div class="dashboard-wide card section-card"><div class="section-head"><h2 class="section-title">${isEmployee?"My Today's Record":"Today's Record"}</h2></div>${attendanceTable(rows)}</div>
      <div class="dashboard-wide card section-card"><div class="section-head"><h2 class="section-title">Attendance History</h2></div>${historyTable(isEmployee?employeeForUser(user)?.id:null)}</div>
    </div>`,"attendance");
  }
  function attendanceTable(rows){
    const ownerOrManager=currentUser().role!=="Employee";
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${person(a.employee)}</td><td>${a.timeIn||"—"}</td><td>${a.timeOut||"—"}</td><td>${statusBadge(a.status)}</td><td><div class="inline-actions">${ownerOrManager?`<button class="icon-btn" title="Mark Present" data-att-action="present" data-id="${a.id}">✓</button><button class="icon-btn" title="Mark Absent" data-att-action="absent" data-id="${a.id}">×</button><button class="btn btn-secondary btn-sm" data-att-action="edit" data-id="${a.id}">Edit</button>`:"—"}</div></td></tr>`).join("")}</tbody></table></div>`;
  }
  function historyTable(employeeId=null){
    let rows=get(DB.attendance);
    if(employeeId) rows=rows.filter(a=>a.employeeId===employeeId);
    rows=rows.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);
    const emps=get(DB.employees);
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Employee</th><th>Time In</th><th>Time Out</th><th>Hours</th><th>OT</th><th>Status</th></tr></thead><tbody>${rows.map(a=>{const e=emps.find(x=>x.id===a.employeeId); const h=calcHours(a.timeIn,a.timeOut); const ot=Math.max(0,h-8);return `<tr><td>${a.date}</td><td>${escapeHtml(e?.name||"Unknown")}</td><td>${a.timeIn||"—"}</td><td>${a.timeOut||"—"}</td><td>${h?h.toFixed(2)+"h":"—"}</td><td>${ot?`+${ot.toFixed(2)}h`:"—"}</td><td>${statusBadge(a.status)}</td></tr>`}).join("")}</tbody></table></div>`;
  }
  function calcHours(t1,t2){
    if(!t1||!t2)return 0;
    const [h1,m1]=t1.split(":").map(Number),[h2,m2]=t2.split(":").map(Number);
    let d=(h2*60+m2)-(h1*60+m1); if(d<0)d+=1440; return d/60;
  }

  function renderSchedules(){
    const emps=get(DB.employees).filter(e=>e.role==="Employee");
    const editable=currentUser().role!=="Employee";
    return shell(`<div class="page">${pageHeader("Employee Schedules","Jan 22–28, 2024")}
      <div class="card section-card"><div class="section-head"><h2 class="section-title">Weekly Schedule</h2></div>
      <div class="table-wrap"><table class="table schedule-table"><thead><tr><th>Employee</th>${DAYS.map(d=>`<th>${d.slice(0,3)}</th>`).join("")}${editable?"<th>Action</th>":""}</tr></thead><tbody>${emps.map(e=>{const s=get(DB.schedules).find(x=>x.employeeId===e.id);return `<tr><td><strong>${escapeHtml(e.name)}</strong></td>${DAYS.map(d=>`<td>${s?`<span class="shift ${shiftClass(s.days[d])}" ${editable?`data-schedule="${e.id}" data-day="${d}"`:``}>${s.days[d]}</span>`:"—"}</td>`).join("")}${editable?`<td><button class="icon-btn" data-action="edit-schedule" data-employee="${e.id}">✎</button></td>`:""}</tr>`}).join("")}</tbody></table></div>
      <div class="schedule-note"><span><i class="dot" style="background:#4F8062"></i>Morning</span><span><i class="dot" style="background:#D99A32"></i>Afternoon</span><span><i class="dot" style="background:#6664a8"></i>Midday</span><span><i class="dot" style="background:#806d5c"></i>Off Day</span></div>
      </div></div>`,"schedules");
  }

  function renderPayroll(){
    const user=currentUser();
    if(user.role==="Employee") return renderEmployeePayroll();
    const rows=get(DB.payroll).map(computePayroll).filter(p=>get(DB.employees).find(e=>e.id===p.employeeId));
    return shell(`<div class="page">${pageHeader("Payroll","January 2024",user.role==="Owner"?`<button class="btn btn-primary" data-action="process-payroll">₱ Process Payroll</button>`:"")}
      <div class="grid grid-4">${statsCard("₱",money(rows.reduce((s,p)=>s+p.basic,0)),"Gross Payroll","")}${statsCard("↘",money(rows.reduce((s,p)=>s+p.deductions,0)),"Total Deductions","red")}${statsCard("↗",money(rows.reduce((s,p)=>s+p.net,0)),"Net Payroll","green")}${statsCard("◷",money(rows.reduce((s,p)=>s+p.overtime,0)),"Overtime Total","gold")}</div>
      <div class="dashboard-wide card section-card"><div class="section-head"><h2 class="section-title">Payroll Summary</h2></div>${payrollTable(rows)}</div>
    </div>`,"payroll");
  }
  function payrollTable(rows){
    const emps=get(DB.employees);
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Employee</th><th>Position</th><th>Basic Salary</th><th>Overtime</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(p=>{const e=emps.find(x=>x.id===p.employeeId);return `<tr class="clickable" data-payroll="${p.id}"><td>${person(e)}</td><td>${escapeHtml(e.position)}</td><td>${money(p.basic)}</td><td class="positive">+${money(p.overtime)}</td><td class="positive">+${money(p.allowances)}</td><td class="negative">-${money(p.deductions)}</td><td><strong>${money(p.net)}</strong></td><td><span class="badge ${p.status==="Paid"?"green":"gold"}">${p.status}</span></td><td><button class="btn btn-secondary btn-sm" data-payroll-view="${p.id}">Payslip</button></td></tr>`}).join("")}</tbody></table></div>`;
  }
  function renderEmployeePayroll(){
    const emp=employeeForUser(currentUser()), p=computePayroll(get(DB.payroll).find(x=>x.employeeId===emp.id)||{basic:emp.basicSalary,overtime:0,allowances:0,sss:0,philhealth:0,pagibig:0,tax:0,other:0});
    return shell(`<div class="page">${pageHeader("Payroll","January 2024")}
      <div class="card payslip">${payslipDetailed(p,emp)}<div class="inline-actions" style="margin-top:15px"><button class="btn btn-secondary" data-action="view-payslip">View Payslip</button><button class="btn btn-primary" data-action="print-payslip">Print / Save PDF</button></div></div>
    </div>`,"payroll");
  }
  function payslipSummary(p){return `<div>${[
    ["Basic Salary",money(p.basic)],["Overtime",`+${money(p.overtime)}`],["Allowances",`+${money(p.allowances)}`],["Total Deductions",`-${money(p.deductions)}`],["Net Pay",money(p.net)]
  ].map((r,i)=>`<div class="payslip-row ${i===4?"net":i===3?"total":""}"><span>${r[0]}</span><strong class="${i===3?"negative":i===1||i===2?"positive":""}">${r[1]}</strong></div>`).join("")}</div>`}
  function payslipDetailed(p,e){
    return `<div class="payslip-head"><div><h2>January 2024 Payslip</h2><div class="small muted">${escapeHtml(e?.name||"Employee")} · ${escapeHtml(e?.position||"")}</div></div><span class="badge green">SAMPLE / DEMO</span></div>
    ${[
      ["Basic Salary",money(p.basic),""],["Overtime Pay","+"+money(p.overtime),"positive"],["Allowances","+"+money(p.allowances),"positive"],["Gross Salary",money(p.gross),"total"],
      ["SSS","-"+money(p.sss),"negative"],["PhilHealth","-"+money(p.philhealth),"negative"],["Pag-IBIG","-"+money(p.pagibig),"negative"],["Withholding Tax","-"+money(p.tax),"negative"],["Other Deductions","-"+money(p.other),"negative"],["Total Deductions","-"+money(p.deductions),"negative total"],["Net Salary",money(p.net),"net"]
    ].map(r=>`<div class="payslip-row ${r[2]}"><span>${r[0]}</span><strong>${r[1]}</strong></div>`).join("")}`;
  }

  function renderNotifications(){
    const user=currentUser(), ns=get(DB.notifications).filter(n=>n.role==="All"||n.role===user.role||n.userId===user.id);
    return shell(`<div class="page">${pageHeader("Notifications",`${ns.filter(n=>n.unread).length} unread`,`<button class="btn btn-secondary" data-action="mark-all-read">Mark all read</button>`)}
      <div class="notification-list">${ns.length?ns.map(n=>`<div class="notification ${n.unread?"unread":""}" data-notification="${n.id}"><div class="notification-icon">${n.icon||"•"}</div><div class="notification-body"><strong>${escapeHtml(n.title)} ${n.unread?'<span class="dot" style="background:#4F8062"></span>':""}</strong><p>${escapeHtml(n.text)}</p><div class="small muted" style="margin-top:5px">${n.time}</div></div><div class="notification-actions">${n.unread?`<button class="icon-btn" title="Mark read" data-not-action="read" data-id="${n.id}">✓</button>`:""}<button class="icon-btn" title="Open" data-not-action="open" data-id="${n.id}">↗</button><button class="icon-btn" title="Delete" data-not-action="delete" data-id="${n.id}">×</button></div></div>`).join(""):`<div class="empty">No notifications.</div>`}</div>
    </div>`,"notifications");
  }

  function renderProfile(){
    const user=currentUser(), e=employeeForUser(user);
    return shell(`<div class="page">${pageHeader("My Profile","")}
      <div class="card profile-card" style="max-width:650px"><div class="profile-head"><div class="profile-person"><span class="avatar">${initials(user.name)}</span><div><h2 class="profile-name">${escapeHtml(user.name)}</h2><div class="profile-sub">${escapeHtml(e?.position||user.role)}</div><div style="margin-top:7px"><span class="badge gold">${user.role}</span> <span class="badge green">active</span></div></div></div><button class="btn btn-primary" data-action="edit-profile">✎ Edit</button></div>
      <div class="card section-card" style="margin-top:14px"><h2 class="section-title">Personal Information</h2><div class="info-grid">
        ${info("Email",user.email)}${info("Phone",user.phone||"—")}${info("Address",user.address||"—")}${info("Hire Date",user.hireDate||"—")}
      </div></div>
      <div class="card section-card" style="margin-top:14px"><h2 class="section-title">Employment Details</h2><div class="info-grid" style="grid-template-columns:repeat(3,1fr)">${info("Employee ID",e?.id||"—")}${info("Department",e?.department||"—")}${info("Status",e?.active?"Active":"Inactive")}</div></div>
    </div>`,"profile");
  }
  function info(a,b){return `<div class="info-item"><label>${a}</label><strong>${escapeHtml(b)}</strong></div>`}

  function renderSettings(){
    const s=get(DB.settings,{});
    return shell(`<div class="page">${pageHeader("Settings","Manage your Bean Scene account")}
      <div class="settings-layout"><div class="settings-nav">${["Account","Payroll","Notifications","Security","Appearance"].map((x,i)=>`<button class="settings-tab ${i===0?"active":""}" data-settings-tab="${x.toLowerCase()}">${x}</button>`).join("")}</div>
      <div id="settings-panel" class="card settings-panel">${settingsGeneral(s)}</div></div>
    </div>`,"settings");
  }
  function settingsGeneral(s){return `<h2 class="section-title">Business Information</h2><div class="form-grid" style="margin-top:15px">
    ${field("Business Name","businessName",s.businessName,"full")}${field("Address","address",s.address,"full")}${field("Phone","phone",s.phone)}${field("Email","email",s.email)}
  </div><button class="btn btn-primary" data-action="save-settings" style="margin-top:14px">▣ Save Changes</button>`}
  function field(label,name,value="",extra=""){return `<div class="field ${extra}"><label>${label}</label><input name="${name}" value="${escapeHtml(value)}"></div>`}

  function calendar(){
    const states={3:"late",12:"absent",16:"late",19:"absent"};
    let html=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<div class="calendar-head">${x}</div>`).join("");
    for(let i=0;i<3;i++)html+=`<div></div>`;
    for(let d=1;d<=31;d++)html+=`<div class="day ${states[d]||((d%7!==0&&d%7!==6)?"present":"")}">${d}</div>`;
    return `<div class="calendar">${html}</div>`;
  }

  function renderLogin(){
    const selected=window.loginRole||"Owner";
    return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Manage your café with ease.</h1><p>Employee management, payroll, attendance, and scheduling — all in one platform built for coffee shop owners.</p></div><div class="auth-stats"><div class="auth-stat"><strong>9</strong><span>Demo Accounts</span></div><div class="auth-stat"><strong>₱318K</strong><span>Monthly Revenue</span></div><div class="auth-stat"><strong>₱96K</strong><span>Payroll Processed</span></div><div class="auth-stat"><strong>94%</strong><span>Attendance Rate</span></div></div></section>
    <section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong><small>Coffee Co.</small></div></div><h1>Welcome back</h1><p class="lead">Sign in to your management account</p>
      <div class="auth-form">
        <div class="auth-role"><strong>Demo Mode — Select Role:</strong><div class="role-buttons">${["Owner","Manager","Employee"].map(r=>`<button class="role-btn ${selected===r?"active":""}" data-login-role="${r}">${r}</button>`).join("")}</div></div>
        <div class="field"><label>Email / Username</label><input id="login-email" value="${selected==="Owner"?"maria.santos@beanscene.ph":selected==="Manager"?"jose.reyes@beanscene.ph":"ana.cruz@beanscene.ph"}" autocomplete="username"></div>
        <div class="field"><label>Password</label><div class="password-field"><input id="login-password" type="password" value="${selected==="Owner"?"Owner@123":selected==="Manager"?"Manager@123":"Employee@123"}" autocomplete="current-password"><button class="password-toggle" data-toggle-password="login-password">◉</button></div></div>
        <label class="checkbox"><input id="remember-me" type="checkbox"> Remember me</label>
        <div class="auth-links"><span></span><button class="link-btn" data-auth="forgot">Forgot password?</button></div>
        <button class="btn btn-primary" id="login-submit">Sign In</button>
      </div>
      <div class="auth-bottom">Don't have an account? <button data-auth="register">Create account</button></div>
      <div class="demo-box" style="margin-top:15px"><strong>Demo credentials:</strong> Owner: maria.santos@beanscene.ph / Owner@123 · Manager: jose.reyes@beanscene.ph / Manager@123 · Employees use Employee@123.</div>
    </div></section></div>`;
  }

  function renderRegister(){
    const user=currentUser();
    const owner=user?.role==="Owner";
    return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Create your management account.</h1><p>Register securely with demo OTP verification and persistent local browser storage.</p></div><div class="auth-stats"><div class="auth-stat"><strong>6 min</strong><span>OTP Lifetime</span></div><div class="auth-stat"><strong>6-digit</strong><span>Demo OTP</span></div></div></section>
    <section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><h1>Create Account</h1><p class="lead">Set up your management account</p>
      <form id="register-form" class="auth-form">
        <div class="form-grid"><div class="field"><label>First Name</label><input name="firstName" required placeholder="Maria"></div><div class="field"><label>Last Name</label><input name="lastName" required placeholder="Santos"></div></div>
        <div class="field"><label>Email Address</label><input name="email" type="email" required placeholder="you@beanscene.ph"></div>
        <div class="field"><label>Role</label><select name="role" required><option value="">Select role...</option><option value="Employee">Employee</option>${owner?'<option value="Manager">Manager</option><option value="Owner">Owner</option>':""}</select></div>
        <div class="form-grid"><div class="field"><label>Phone</label><input name="phone" required placeholder="+63 9XX XXX XXXX"></div><div class="field"><label>Department</label><select name="department" required><option value="">Select department...</option><option>Service</option><option>Kitchen</option><option>Operations</option><option>Management</option></select></div></div>
        <div class="form-grid"><div class="field"><label>Password</label><div class="password-field"><input id="register-password" name="password" type="password" required minlength="8"><button type="button" class="password-toggle" data-toggle-password="register-password">◉</button></div></div><div class="field"><label>Confirm Password</label><input id="register-confirm" name="confirmPassword" type="password" required></div></div>
        <div class="field captcha-field"><label>Security Check</label><div class="captcha-box"><div class="captcha-question"><span id="captcha-question"></span></div><button type="button" class="captcha-refresh" id="refresh-captcha" title="Refresh CAPTCHA">↻</button></div><input id="register-captcha" name="captcha" inputmode="numeric" autocomplete="off" required placeholder="Enter the answer"></div>
        <button class="btn btn-primary" type="submit">Create Account</button>
      </form>
      <div class="auth-bottom">Already have an account? <button data-auth="login">Sign in</button></div>
    </div></section></div>`;
  }

  function setupCaptcha(force=false){
    let c=get(DB.captcha,null);
    if(force || !c || !c.createdAt || Date.now()-c.createdAt>600000){
      const a=Math.floor(Math.random()*8)+2,b=Math.floor(Math.random()*8)+1;
      c={a,b,answer:String(a+b),createdAt:Date.now()};
      set(DB.captcha,c);
    }
    const q=$("#captcha-question");
    if(q) q.textContent=`${c.a} + ${c.b} = ?`;
  }
  function refreshCaptcha(){ setupCaptcha(true); const input=$("#register-captcha"); if(input){input.value="";input.focus();} toast("CAPTCHA refreshed."); }

  function renderLoginOTP(){
    const pending=get(DB.pendingLoginOTP,null);
    if(!pending) return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Secure sign in.</h1><p>No active verification request was found. Return to the login page and sign in again.</p></div></section><section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong><small>Coffee Co.</small></div></div><h1>Verification unavailable</h1><p class="lead">Your login verification request has expired or is no longer available.</p><button class="btn btn-primary" data-auth="login">Back to Login</button></div></section></div>`;
    return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Two-factor authentication.</h1><p>Verify your identity with the one-time password generated for this demo login.</p><div class="auth-stats"><div class="auth-stat"><strong>2FA</strong><span>Required for every account</span></div><div class="auth-stat"><strong>5 min</strong><span>OTP Lifetime</span></div></div></div></section>
    <section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong><small>Coffee Co.</small></div></div><h1>Verify Sign In</h1><p class="lead">Enter the 6-digit verification code for ${escapeHtml(pending.email||"your account")}.</p>
      <div class="demo-box"><strong>DEMO 2FA OTP</strong><div class="otp-code">${escapeHtml(pending.otp||"------")}</div><div class="small">This demo code is displayed here instead of being sent by SMS/email. Expires in <span id="login-otp-countdown">5:00</span></div></div>
      <div class="auth-form" style="margin-top:14px"><div class="field"><label>Enter 6-Digit OTP</label><input id="login-otp-input" maxlength="6" minlength="6" inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code" placeholder="000000"></div><button class="btn btn-primary" id="verify-login-otp">Verify & Sign In</button><button class="btn btn-secondary" id="resend-login-otp">Resend OTP</button></div>
      <div class="auth-bottom"><button data-auth="login">Cancel and return to Login</button></div>
    </div></section></div>`;
  }

  function renderOTP(){
    const pending=get(DB.pendingOTP,null);
    return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Verify your account.</h1><p>Enter the one-time password generated for this demo registration.</p></div></section>
    <section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><h1>OTP Verification</h1><p class="lead">A 6-digit demo OTP was generated for ${escapeHtml(pending?.email||"your account")}.</p>
      <div class="demo-box"><strong>DEMO OTP</strong><div class="otp-code">${pending?.otp||"------"}</div><div class="small">Expires in <span id="otp-countdown">5:00</span></div></div>
      <div class="auth-form" style="margin-top:14px"><div class="field"><label>Enter 6-Digit OTP</label><input id="otp-input" maxlength="6" minlength="6" inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code" placeholder="000000"></div><button class="btn btn-primary" id="verify-otp">Verify OTP</button><button class="btn btn-secondary" id="resend-otp">Resend OTP</button></div>
      <div class="auth-bottom"><button data-auth="login">Back to Login</button></div>
    </div></section></div>`;
  }

  function renderForgot(){
    return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Recover your account.</h1><p>Generate a demo reset OTP and set a new password without a backend service.</p></div></section>
    <section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><h1>Forgot Password</h1><p class="lead">Enter your email address and we'll generate a demo reset OTP.</p>
      <div class="auth-form"><div class="field"><label>Email Address</label><input id="forgot-email" type="email" placeholder="you@beanscene.ph"></div><button class="btn btn-primary" id="send-reset-otp">Send Reset OTP</button></div>
      <div class="auth-bottom"><button data-auth="login">← Back to Sign In</button></div>
    </div></section></div>`;
  }

  function renderReset(){
    const p=get(DB.pendingReset,null);
    return `<div class="auth-shell"><section class="auth-brand"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><div class="auth-hero"><h1>Reset your password.</h1><p>Verify the demo reset OTP, then save a new password to localStorage.</p></div></section>
    <section class="auth-panel"><div class="auth-card"><div class="brand"><div class="brand-mark">☕</div><div><strong>Bean Scene Coffee Co.</strong></div></div><h1>Reset Password</h1><p class="lead">${escapeHtml(p?.email||"")} · Step ${p?.verified?"2":"1"} of 2</p>
      ${!p?.verified?`<div class="demo-box"><strong>DEMO RESET OTP</strong><div class="otp-code">${p?.otp||"------"}</div><div class="small">Expires in <span id="reset-countdown">5:00</span></div></div><div class="auth-form" style="margin-top:14px"><div class="field"><label>Enter 6-Digit Reset OTP</label><input id="reset-otp" maxlength="6" minlength="6" inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code" placeholder="000000"></div><button class="btn btn-primary" id="verify-reset-otp">Verify OTP</button></div>`:
      `<div class="auth-form"><div class="field"><label>New Password</label><input id="new-password" type="password" minlength="8"></div><div class="field"><label>Confirm Password</label><input id="confirm-new-password" type="password"></div><button class="btn btn-primary" id="save-reset-password">Save New Password</button></div>`}
      <div class="auth-bottom"><button data-auth="login">Back to Login</button></div>
    </div></section></div>`;
  }

  function showModal(title,body,footer="",small=false){
    $("#modal-root").innerHTML=`<div class="modal-backdrop" id="modal-backdrop"><div class="modal ${small?"small":""}" role="dialog"><div class="modal-head"><h3>${title}</h3><button class="icon-btn" id="modal-close">×</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-foot">${footer}</div>`:""}</div></div>`;
    $("#modal-close").addEventListener("click",closeModal);
    $("#modal-backdrop").addEventListener("click",e=>{if(e.target.id==="modal-backdrop")closeModal()});
  }
  function closeModal(){ $("#modal-root").innerHTML=""; }
  function employeeForm(e={}){
    return `<div class="form-grid"><div class="field"><label>First Name</label><input id="ef-first" value="${escapeHtml(e.name?.split(" ")[0]||"")}"></div><div class="field"><label>Last Name</label><input id="ef-last" value="${escapeHtml(e.name?.split(" ").slice(1).join(" ")||"")}"></div>
      <div class="field full"><label>Email</label><input id="ef-email" type="email" value="${escapeHtml(e.email||"")}"></div>
      <div class="field"><label>Position</label><input id="ef-position" value="${escapeHtml(e.position||"")}"></div><div class="field"><label>Department</label><select id="ef-dept">${["Service","Kitchen","Operations","Management"].map(x=>`<option ${e.department===x?"selected":""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label>Phone</label><input id="ef-phone" value="${escapeHtml(e.phone||"")}"></div><div class="field"><label>Basic Salary</label><input id="ef-salary" type="number" min="0" value="${e.basicSalary||0}"></div>
    </div>`;
  }

  function openEmployeeModal(id=null){
    const e=id?get(DB.employees).find(x=>x.id===id):null;
    showModal(id?"Edit Employee":"Add Employee",employeeForm(e||{}),`<button class="btn btn-secondary" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="save-employee">Save Employee</button>`);
    $("#modal-cancel").onclick=closeModal;
    $("#save-employee").onclick=()=>{
      const first=$("#ef-first").value.trim(),last=$("#ef-last").value.trim(),email=$("#ef-email").value.trim();
      if(!first||!last||!email||!$("#ef-position").value.trim())return toast("Please complete required fields.","error");
      const emps=get(DB.employees);
      if(!id && emps.some(x=>x.email.toLowerCase()===email.toLowerCase()))return toast("Employee email already exists.","error");
      if(id){
        Object.assign(emps.find(x=>x.id===id),{name:`${first} ${last}`,email,position:$("#ef-position").value.trim(),department:$("#ef-dept").value,phone:$("#ef-phone").value,basicSalary:Number($("#ef-salary").value)||0});
        const users=get(DB.users), emp=emps.find(x=>x.id===id),u=users.find(x=>x.id===emp.userId); if(u){u.name=emp.name;u.firstName=first;u.lastName=last;u.email=email;u.phone=emp.phone;set(DB.users,users)}
        set(DB.employees,emps);toast("Employee updated successfully.");
      }else{
        const user={id:uid("USR"),firstName:first,lastName:last,name:`${first} ${last}`,email,password:"Employee@123",role:"Employee",phone:$("#ef-phone").value,address:"",hireDate:todayISO()};
        const emp={id:"EMP"+String(emps.length+1).padStart(3,"0"),userId:user.id,name:user.name,email,position:$("#ef-position").value.trim(),department:$("#ef-dept").value,role:"Employee",active:true,phone:user.phone,address:"",hireDate:user.hireDate,basicSalary:Number($("#ef-salary").value)||0};
        set(DB.users,[...get(DB.users),user]);set(DB.employees,[...emps,emp]);toast("Employee added successfully.");
      }
      closeModal();render();
    };
  }

  function openEmployeeDetails(id){
    const e=get(DB.employees).find(x=>x.id===id); if(!e)return;
    const owner=currentUser().role==="Owner";
    showModal("Employee Details",`<div class="profile-person"><span class="avatar">${initials(e.name)}</span><div><h2 class="profile-name">${escapeHtml(e.name)}</h2><div class="profile-sub">${escapeHtml(e.position)}</div><div style="margin-top:7px">${statusBadge(e.active?"Present":"Absent")} <span class="badge ${e.role==="Employee"?"gold":"green"}">${e.role}</span></div></div></div><div class="info-grid">${info("Employee ID",e.id)}${info("Department",e.department)}${info("Email",e.email)}${info("Phone",e.phone||"—")}${info("Hire Date",e.hireDate||"—")}${info("Basic Salary",money(e.basicSalary))}</div>`,
      `<button class="btn btn-secondary" id="detail-close">Close</button><button class="btn btn-secondary" id="detail-edit">Edit</button>${owner?(e.active?`<button class="btn btn-secondary" id="detail-toggle">Deactivate</button>`:`<button class="btn btn-green" id="detail-toggle">Activate</button>`):""}${owner?`<button class="btn btn-danger" id="detail-delete">Delete</button>`:""}`);
    $("#detail-close").onclick=closeModal;$("#detail-edit").onclick=()=>{closeModal();openEmployeeModal(id)};
    if($("#detail-toggle"))$("#detail-toggle").onclick=()=>{const es=get(DB.employees),x=es.find(y=>y.id===id);x.active=!x.active;set(DB.employees,es);toast(x.active?"Employee activated.":"Employee deactivated.");closeModal();render()};
    if($("#detail-delete"))$("#detail-delete").onclick=()=>confirmDeleteEmployee(id);
  }
  function confirmDeleteEmployee(id){
    const e=get(DB.employees).find(x=>x.id===id);
    showModal("Delete Employee",`<p class="confirm-text">Delete <strong>${escapeHtml(e.name)}</strong>? This removes the employee from the demo employee list. The account is also removed.</p>`,`<button class="btn btn-secondary" id="delete-cancel">Cancel</button><button class="btn btn-danger" id="delete-confirm">Delete</button>`,true);
    $("#delete-cancel").onclick=closeModal;$("#delete-confirm").onclick=()=>{set(DB.employees,get(DB.employees).filter(x=>x.id!==id));set(DB.users,get(DB.users).filter(x=>x.id!==e.userId));set(DB.payroll,get(DB.payroll).filter(x=>x.employeeId!==id));set(DB.attendance,get(DB.attendance).filter(x=>x.employeeId!==id));set(DB.schedules,get(DB.schedules).filter(x=>x.employeeId!==id));toast("Employee deleted.");closeModal();render()};
  }

  function openAttendanceModal(attId=null, forcedEmployee=null){
    const emps=get(DB.employees).filter(e=>e.role==="Employee"&&e.active), a=attId?get(DB.attendance).find(x=>x.id===attId):null;
    showModal(attId?"Edit Attendance":"Record Attendance",`<div class="form-grid"><div class="field full"><label>Employee</label><select id="af-employee">${emps.map(e=>`<option value="${e.id}" ${((a?.employeeId||forcedEmployee)===e.id)?"selected":""}>${escapeHtml(e.name)}</option>`).join("")}</select></div><div class="field"><label>Date</label><input id="af-date" type="date" value="${a?.date||todayISO()}"></div><div class="field"><label>Status</label><select id="af-status">${["Present","Late","Absent"].map(s=>`<option ${a?.status===s?"selected":""}>${s}</option>`).join("")}</select></div><div class="field"><label>Time In</label><input id="af-in" type="time" value="${a?.timeIn||""}"></div><div class="field"><label>Time Out</label><input id="af-out" type="time" value="${a?.timeOut||""}"></div></div>`,
    `<button class="btn btn-secondary" id="attendance-cancel">Cancel</button><button class="btn btn-primary" id="attendance-save">Save Attendance</button>`);
    $("#attendance-cancel").onclick=closeModal;$("#attendance-save").onclick=()=>{
      const arr=get(DB.attendance);const obj={id:a?.id||uid("ATT"),employeeId:$("#af-employee").value,date:$("#af-date").value,status:$("#af-status").value,timeIn:$("#af-in").value,timeOut:$("#af-out").value};
      if(a)Object.assign(a,obj);else arr.push(obj);set(DB.attendance,arr);toast("Attendance recorded.");closeModal();render();
    };
  }

  function openScheduleModal(empId,day="Monday"){
    const e=get(DB.employees).find(x=>x.id===empId), s=get(DB.schedules).find(x=>x.employeeId===empId);
    showModal("Edit Schedule",`<div class="form-grid"><div class="field full"><label>Employee</label><select id="sf-employee">${get(DB.employees).filter(x=>x.role==="Employee").map(x=>`<option value="${x.id}" ${x.id===empId?"selected":""}>${escapeHtml(x.name)}</option>`).join("")}</select></div><div class="field"><label>Day</label><select id="sf-day">${DAYS.map(x=>`<option ${x===day?"selected":""}>${x}</option>`).join("")}</select></div><div class="field"><label>Shift</label><select id="sf-shift">${SHIFT_OPTIONS.map(x=>`<option ${s?.days[day]===x?"selected":""}>${x}</option>`).join("")}</select></div></div>`,`<button class="btn btn-secondary" id="schedule-cancel">Cancel</button><button class="btn btn-primary" id="schedule-save">Save Changes</button>`);
    $("#schedule-cancel").onclick=closeModal;$("#schedule-save").onclick=()=>{
      const arr=get(DB.schedules), id=$("#sf-employee").value, d=$("#sf-day").value, sh=$("#sf-shift").value;
      let row=arr.find(x=>x.employeeId===id); if(!row){row={employeeId:id,week:"2024-01-22",days:{}};arr.push(row)} row.days[d]=sh;set(DB.schedules,arr);toast("Schedule updated.");closeModal();render();
    };
  }

  function openPayslip(pId){
    const p=computePayroll(get(DB.payroll).find(x=>x.id===pId)||{}),e=get(DB.employees).find(x=>x.id===p.employeeId);
    showModal("Payslip",payslipDetailed(p,e),`<button class="btn btn-secondary" id="payslip-close">Close</button><button class="btn btn-primary" id="payslip-print">Print / Save PDF</button>`);
    $("#payslip-close").onclick=closeModal;$("#payslip-print").onclick=()=>printPayslip(p,e);
  }
  function printPayslip(p=null,e=null){
    if(!p){e=employeeForUser(currentUser());p=computePayroll(get(DB.payroll).find(x=>x.employeeId===e.id)||{});}
    const html=`<!doctype html><html><head><title>Bean Scene Payslip</title><style>body{font-family:Arial;padding:40px;color:#332117}h1{font-family:Georgia}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #ddd}td:last-child{text-align:right;font-weight:bold}.net{font-size:20px}</style></head><body><h1>Bean Scene Coffee Co.</h1><p>${escapeHtml(e.name)} · ${escapeHtml(e.position||"")}</p><h2>January 2024 Payslip</h2><table>${[["Basic Salary",money(p.basic)],["Overtime Pay","+"+money(p.overtime)],["Allowances","+"+money(p.allowances)],["Gross Salary",money(p.gross)],["SSS","-"+money(p.sss)],["PhilHealth","-"+money(p.philhealth)],["Pag-IBIG","-"+money(p.pagibig)],["Withholding Tax","-"+money(p.tax)],["Other Deductions","-"+money(p.other)],["Total Deductions","-"+money(p.deductions)],["Net Salary",money(p.net)]].map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join("")}</table><script>window.onload=()=>window.print()<\/script></body></html>`;
    const w=window.open("","_blank"); if(w){w.document.write(html);w.document.close()} else toast("Popup blocked. Please allow popups to print the payslip.","error");
  }

  function openProfileModal(){
    const u=currentUser(),e=employeeForUser(u);
    showModal("Edit Profile",`<div class="form-grid">${field("First Name","pf-first",u.firstName)}${field("Last Name","pf-last",u.lastName)}${field("Email","pf-email",u.email,"full")}${field("Phone","pf-phone",u.phone||"")} ${field("Address","pf-address",u.address||"","full")}</div>`,`<button class="btn btn-secondary" id="profile-cancel">Cancel</button><button class="btn btn-primary" id="profile-save">Save Profile</button>`);
    $("#profile-cancel").onclick=closeModal;$("#profile-save").onclick=()=>{
      const users=get(DB.users),x=users.find(z=>z.id===u.id),first=$("#pf-first").value.trim(),last=$("#pf-last").value.trim(),email=$("#pf-email").value.trim();
      if(!first||!last||!email)return toast("Complete required fields.","error");
      Object.assign(x,{firstName:first,lastName:last,name:`${first} ${last}`,email,phone:$("#pf-phone").value,address:$("#pf-address").value});
      set(DB.users,users);const es=get(DB.employees),ee=es.find(z=>z.userId===u.id);if(ee)Object.assign(ee,{name:x.name,email:x.email,phone:x.phone,address:x.address});set(DB.employees,es);
      toast("Profile updated.");closeModal();render();
    };
  }

  function openChangePassword(){
    showModal("Change Password",`<div class="auth-form"><div class="field"><label>Current Password</label><input id="cp-old" type="password"></div><div class="field"><label>New Password</label><input id="cp-new" type="password" minlength="8"></div><div class="field"><label>Confirm New Password</label><input id="cp-confirm" type="password"></div></div>`,`<button class="btn btn-secondary" id="cp-cancel">Cancel</button><button class="btn btn-primary" id="cp-save">Change Password</button>`);
    $("#cp-cancel").onclick=closeModal;$("#cp-save").onclick=()=>{
      const u=currentUser();if($("#cp-old").value!==u.password)return toast("Current password is incorrect.","error");
      if($("#cp-new").value.length<8)return toast("Password must be at least 8 characters.","error");
      if($("#cp-new").value!==$("#cp-confirm").value)return toast("Passwords do not match.","error");
      const users=get(DB.users),x=users.find(z=>z.id===u.id);x.password=$("#cp-new").value;set(DB.users,users);toast("Password changed successfully.");closeModal();
    };
  }

  function processPayroll(){
    const ps=get(DB.payroll);ps.forEach(p=>p.status="Paid");set(DB.payroll,ps);toast("Payroll processed.");render();
  }

  function render(){
    if(!checkAuth())return;
    const root=$("#app"), user=currentUser(), hash=location.hash.replace("#","")||"login";
    if(!user){
      if(hash==="register")root.innerHTML=renderRegister();
      else if(hash==="otp")root.innerHTML=renderOTP();
      else if(hash==="login-otp")root.innerHTML=renderLoginOTP();
      else if(hash==="forgot")root.innerHTML=renderForgot();
      else if(hash==="reset")root.innerHTML=renderReset();
      else root.innerHTML=renderLogin();
      bindAuth();
      if(hash==="register")setupCaptcha();
      if(hash==="otp")startCountdown("otp");
      if(hash==="login-otp")startCountdown("login");
      if(hash==="reset")startCountdown("reset");
      return;
    }
    let page=hash;if(!allowed(user.role,page))page="dashboard";
    if(page==="dashboard")root.innerHTML=user.role==="Owner"?renderOwnerDashboard():user.role==="Manager"?renderManagerDashboard():renderEmployeeDashboard();
    else if(page==="employees")root.innerHTML=renderEmployees();
    else if(page==="attendance")root.innerHTML=renderAttendance();
    else if(page==="schedules")root.innerHTML=renderSchedules();
    else if(page==="payroll")root.innerHTML=renderPayroll();
    else if(page==="notifications")root.innerHTML=renderNotifications();
    else if(page==="profile")root.innerHTML=renderProfile();
    else if(page==="reports")root.innerHTML=renderReports();
    else if(page==="settings")root.innerHTML=renderSettings();
    else {location.hash="#dashboard";return}
    bindApp();
    if(page==="employees")renderEmployeeCards();
  }

  function renderReports(){
    const ps=get(DB.payroll).map(computePayroll), total=ps.reduce((s,p)=>s+p.net,0), att=get(DB.attendance);
    return shell(`<div class="page">${pageHeader("Reports","January 2024")}
      <div class="grid grid-4">${statsCard("↗","₱318K","Total Revenue","blue","+8.2% vs last month")}${statsCard("₱",money(total),"Net Payroll","")}${statsCard("♙",get(DB.employees).filter(e=>e.active).length,"Active Employees","")}${statsCard("◷","92%","Attendance Rate","green","+1.5% vs last month")}</div>
      <div class="dashboard-two"><div class="card section-card"><div class="section-head"><h2 class="section-title">Revenue vs Expenses</h2></div>${weeklyChart()}</div><div class="card section-card"><div class="section-head"><h2 class="section-title">Attendance Breakdown</h2></div><div style="padding:30px;text-align:center"><div style="width:150px;height:150px;border-radius:50%;border:24px solid var(--green);border-right-color:var(--gold);border-bottom-color:var(--red);margin:auto"></div><p class="small muted">Present 82% · Late 10% · Absent 8%</p></div></div></div>
      <div class="dashboard-wide card section-card"><div class="section-head"><h2 class="section-title">Monthly Payroll Trend</h2></div>${payrollTable(ps)}</div>
    </div>`,"reports");
  }

  function bindAuth(){
    $$("[data-login-role]").forEach(b=>b.addEventListener("click",()=>{window.loginRole=b.dataset.loginRole;render()}));
    $$("[data-toggle-password]").forEach(b=>b.addEventListener("click",()=>{const x=$("#"+b.dataset.togglePassword)||document.getElementsByName(b.dataset.togglePassword)[0];if(!x)return;x.type=x.type==="password"?"text":"password"}));
    $$("[data-auth]").forEach(b=>b.addEventListener("click",()=>location.hash="#"+b.dataset.auth));
    const login=$("#login-submit");if(login)login.addEventListener("click",loginAction);
    const rf=$("#register-form");if(rf)rf.addEventListener("submit",e=>{e.preventDefault();registerAction(new FormData(rf))});
    const rc=$("#refresh-captcha");if(rc)rc.onclick=refreshCaptcha;
    const vo=$("#verify-otp");if(vo)vo.onclick=verifyRegistrationOTP;
    const vlo=$("#verify-login-otp");if(vlo)vlo.onclick=verifyLoginOTP;
    const rlo=$("#resend-login-otp");if(rlo)rlo.onclick=resendLoginOTP;
    const ro=$("#resend-otp");if(ro)ro.onclick=resendOTP;
    const sr=$("#send-reset-otp");if(sr)sr.onclick=sendResetOTP;
    const vro=$("#verify-reset-otp");if(vro)vro.onclick=verifyResetOTP;
    const srp=$("#save-reset-password");if(srp)srp.onclick=saveResetPassword;
  }

  function loginAction(){
    const email=$("#login-email").value.trim().toLowerCase(),pass=$("#login-password").value;
    const u=get(DB.users).find(x=>x.email.toLowerCase()===email);
    if(!u)return toast("Account not found.","error");
    if(u.password!==pass)return toast("Invalid password.","error");
    const otp=String(Math.floor(100000+Math.random()*900000));
    set(DB.pendingLoginOTP,{userId:u.id,email:u.email,role:u.role,otp,createdAt:Date.now()});
    toast(`2FA Demo OTP: ${otp}`,"success");
    location.hash="#login-otp";
  }

  function verifyLoginOTP(){
    const p=get(DB.pendingLoginOTP,null),v=$("#login-otp-input")?.value.trim();
    if(!p)return toast("No active login verification. Please sign in again.","error");
    if(Date.now()-p.createdAt>300000){set(DB.pendingLoginOTP,null);return toast("OTP expired. Please sign in again.","error");}
    if(!/^\d{6}$/.test(v||""))return toast("Enter the 6-digit OTP.","error");
    if(v!==p.otp)return toast("Incorrect OTP. Please try again.","error");
    const u=get(DB.users,[]).find(x=>x.id===p.userId);
    if(!u){set(DB.pendingLoginOTP,null);location.hash="#login";return toast("Account no longer exists.","error");}
    set(DB.pendingLoginOTP,null);
    saveSession(u);
    toast(`2FA verified. Welcome back, ${u.firstName}.`,"success");
    location.hash="#dashboard";
  }

  function resendLoginOTP(){
    const p=get(DB.pendingLoginOTP,null);
    if(!p)return toast("No active login verification. Please sign in again.","error");
    p.otp=String(Math.floor(100000+Math.random()*900000));
    p.createdAt=Date.now();
    set(DB.pendingLoginOTP,p);
    toast(`New 2FA Demo OTP: ${p.otp}`,"success");
    render();
  }

  function registerAction(fd){
    const first=String(fd.get("firstName")||"").trim(),last=String(fd.get("lastName")||"").trim(),email=String(fd.get("email")||"").trim().toLowerCase(),role=String(fd.get("role")||""),pass=String(fd.get("password")||""),confirm=String(fd.get("confirmPassword")||""),phone=String(fd.get("phone")||"").trim(),department=String(fd.get("department")||""),captcha=Number(fd.get("captcha"));
    if(!first||!last||!email||!role||!pass||!confirm||!phone||!department)return toast("Please complete all required fields.","error");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast("Enter a valid email address.","error");
    if(pass.length<8)return toast("Password must be at least 8 characters.","error");
    if(pass!==confirm)return toast("Passwords do not match.","error");
    const c=get(DB.captcha,null);
    if(!c || Date.now()-c.createdAt>600000)return toast("CAPTCHA expired. Please refresh it.","error");
    if(String(captcha)!==String(c.answer))return toast("CAPTCHA answer is incorrect.","error");
    if(get(DB.users).some(u=>u.email.toLowerCase()===email))return toast("An account with this email already exists.","error");
    if(role!=="Employee" && currentUser()?.role!=="Owner")return toast("Only an Owner can create Manager/Owner accounts.","error");
    const otp=String(Math.floor(100000+Math.random()*900000));
    set(DB.pendingOTP,{first,last,email,role,password:pass,phone,department,otp,createdAt:Date.now()});
    toast(`Demo OTP: ${otp}`,"success");location.hash="#otp";
  }

  function startCountdown(type){
    const config={otp:[DB.pendingOTP,"otp-countdown"],login:[DB.pendingLoginOTP,"login-otp-countdown"],reset:[DB.pendingReset,"reset-countdown"]}[type];
    if(!config)return;
    const [key,id]=config;
    const tick=()=>{const p=get(key,null),el=$("#"+id);if(!p||!el)return;const left=Math.max(0,300-Math.floor((Date.now()-p.createdAt)/1000));el.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;if(left===0)el.textContent="Expired";};
    tick();setInterval(tick,1000);
  }
  function verifyRegistrationOTP(){
    const p=get(DB.pendingOTP,null),v=$("#otp-input").value.trim();
    if(!p)return toast("No pending registration.","error");
    if(Date.now()-p.createdAt>300000)return toast("OTP expired. Please resend.","error");
    if(v!==p.otp)return toast("Incorrect OTP.","error");
    const users=get(DB.users),newUser={id:uid("USR"),firstName:p.first,lastName:p.last,name:`${p.first} ${p.last}`,email:p.email,password:p.password,role:p.role,phone:p.phone,address:"",hireDate:todayISO()};
    users.push(newUser);set(DB.users,users);
    const emps=get(DB.employees);
    if(p.role==="Employee"){const eid="EMP"+String(Math.max(0,...emps.map(e=>Number(e.id.replace(/\D/g,""))||0))+1).padStart(3,"0");emps.push({id:eid,userId:newUser.id,name:newUser.name,email:newUser.email,position:"Barista",department:p.department,role:"Employee",active:true,phone:p.phone,address:"",hireDate:newUser.hireDate,basicSalary:15000});set(DB.employees,emps);}
    set(DB.pendingOTP,null);toast("OTP verified. Account created successfully.");location.hash="#login";
  }
  function resendOTP(){
    const p=get(DB.pendingOTP,null);if(!p)return;
    p.otp=String(Math.floor(100000+Math.random()*900000));p.createdAt=Date.now();set(DB.pendingOTP,p);toast(`New demo OTP: ${p.otp}`);render();
  }
  function sendResetOTP(){
    const email=$("#forgot-email").value.trim().toLowerCase(),u=get(DB.users).find(x=>x.email.toLowerCase()===email);
    if(!u)return toast("No account exists for that email.","error");
    const otp=String(Math.floor(100000+Math.random()*900000));set(DB.pendingReset,{userId:u.id,email:u.email,otp,createdAt:Date.now(),verified:false});toast(`Demo reset OTP: ${otp}`);location.hash="#reset";
  }
  function verifyResetOTP(){
    const p=get(DB.pendingReset,null);if(!p)return toast("No reset request.","error");
    if(Date.now()-p.createdAt>300000)return toast("Reset OTP expired.","error");
    if($("#reset-otp").value.trim()!==p.otp)return toast("Incorrect reset OTP.","error");
    p.verified=true;set(DB.pendingReset,p);toast("Reset OTP verified.");render();
  }
  function saveResetPassword(){
    const p=get(DB.pendingReset,null),a=$("#new-password").value,b=$("#confirm-new-password").value;
    if(!p?.verified)return toast("Verify the reset OTP first.","error");
    if(a.length<8)return toast("Password must be at least 8 characters.","error");
    if(a!==b)return toast("Passwords do not match.","error");
    const us=get(DB.users),u=us.find(x=>x.id===p.userId);u.password=a;set(DB.users,us);set(DB.pendingReset,null);toast("Password changed successfully.");location.hash="#login";
  }

  function bindApp(){
    $$("[data-nav]").forEach(b=>b.addEventListener("click",()=>{navigate(b.dataset.nav);$("#sidebar")?.classList.remove("open")}));
    const mt=$("#mobile-toggle");if(mt)mt.onclick=()=>$("#sidebar").classList.toggle("open");
    const pm=$("#profile-menu-button");if(pm)pm.onclick=()=>$("#profile-menu").classList.toggle("open");
    const lo=$("#logout-btn");if(lo)lo.onclick=logout;
    const ss=$("#sidebar-settings");if(ss)ss.onclick=()=>navigate("settings");

    $$("[data-action]").forEach(b=>b.addEventListener("click",()=>handleAction(b.dataset.action,b)));
    $$("[data-filter]").forEach(b=>b.addEventListener("click",()=>{$$("[data-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderEmployeeCards(b.dataset.filter,$("#employee-search")?.value||"")}));
    const search=$("#employee-search");if(search)search.addEventListener("input",()=>renderEmployeeCards($(".filter.active")?.dataset.filter||"all",search.value));
    $$("[data-employee]").forEach(b=>b.addEventListener("click",()=>openEmployeeDetails(b.dataset.employee)));
    $$("[data-att-action]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.id,a=get(DB.attendance).find(x=>x.id===id);if(b.dataset.attAction==="edit")openAttendanceModal(id);else{a.status=b.dataset.attAction==="present"?"Present":"Absent";if(a.status==="Absent")a.timeIn="";set(DB.attendance,get(DB.attendance));toast(`Attendance marked ${a.status.toLowerCase()}.`);render()}}));
    $$("[data-schedule]").forEach(b=>b.addEventListener("click",()=>openScheduleModal(b.dataset.schedule,b.dataset.day)));
    $$("[data-payroll]").forEach(b=>b.addEventListener("click",e=>{if(!e.target.closest("[data-payroll-view]"))openPayslip(b.dataset.payroll)}));
    $$("[data-payroll-view]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openPayslip(b.dataset.payrollView)}));
    $$("[data-not-action]").forEach(b=>b.addEventListener("click",()=>notificationAction(b.dataset.notAction,b.dataset.id)));
    $$("[data-settings-tab]").forEach(b=>b.addEventListener("click",()=>settingsTab(b.dataset.settingsTab)));
  }

  function handleAction(a,b){
    if(a==="add-employee")return openEmployeeModal();
    if(a==="record-attendance")return openAttendanceModal();
    if(a==="manage-schedule")return navigate("schedules");
    if(a==="process-payroll")return processPayroll();
    if(a==="mark-absence"){const rows=getTodayAttendance();const target=rows.find(x=>x.status!=="Absent");if(target){target.status="Absent";target.timeIn="";set(DB.attendance,get(DB.attendance));toast("Employee marked absent.");render()}else toast("No eligible attendance record.","warn");return}
    if(a==="approve-overtime")return toast("Overtime request approved.");
    if(a==="view-payslip"){const p=get(DB.payroll).find(x=>x.employeeId===employeeForUser(currentUser())?.id);return openPayslip(p?.id)}
    if(a==="print-payslip")return printPayslip();
    if(a==="edit-profile")return openProfileModal();
    if(a==="mark-all-read"){const u=currentUser(),ns=get(DB.notifications);ns.forEach(n=>{if(n.role==="All"||n.role===u.role||n.userId===u.id)n.unread=false});set(DB.notifications,ns);toast("All notifications marked read.");render();return}
    if(a==="edit-schedule")return openScheduleModal(b.dataset.employee);
    if(a==="save-settings")return saveSettings();
  }
  function notificationAction(action,id){
    const ns=get(DB.notifications),n=ns.find(x=>x.id===id);
    if(!n)return;
    if(action==="read"){n.unread=false;toast("Notification marked read.");}
    if(action==="delete"){set(DB.notifications,ns.filter(x=>x.id!==id));toast("Notification deleted.");render();return}
    if(action==="open"){n.unread=false;toast(n.text,"success");}
    set(DB.notifications,ns);render();
  }
  function settingsTab(tab){
    const p=$("#settings-panel");if(!p)return;
    if(tab==="account"||tab==="general")p.innerHTML=settingsGeneral(get(DB.settings));
    else if(tab==="security")p.innerHTML=`<h2 class="section-title">Security</h2><p class="muted">Change your account password or sign out.</p><button class="btn btn-primary" data-action="change-password">Change Password</button><button class="btn btn-secondary" data-action="logout" style="margin-left:7px">Logout</button>`;
    else if(tab==="notifications")p.innerHTML=`<h2 class="section-title">Notification Preferences</h2>${toggleRow("Email notifications","Receive account and payroll notifications.","emailNotifications")}${toggleRow("Attendance alerts","Receive alerts for attendance changes.","attendanceAlerts")}`;
    else if(tab==="appearance") {
      const s=get(DB.settings,{}), dark=s.theme==="dark";
      p.innerHTML=`<h2 class="section-title">Appearance</h2><p class="muted">Choose how Bean Scene looks in this browser. Your choice is saved automatically.</p>
        <div class="appearance-options">
          <button class="appearance-option ${!dark?"selected":""}" data-theme-choice="light"><span class="appearance-preview light-preview"><i></i></span><span><strong>Light mode</strong><small>Warm cream Bean Scene interface</small></span><span class="appearance-check">${!dark?"✓":""}</span></button>
          <button class="appearance-option ${dark?"selected":""}" data-theme-choice="dark"><span class="appearance-preview dark-preview"><i></i></span><span><strong>Dark mode</strong><small>Low-light coffee interface</small></span><span class="appearance-check">${dark?"✓":""}</span></button>
        </div>
        <div class="toggle-row"><div><strong>Dark mode</strong><div class="small muted">Switch between light and dark appearance.</div></div><button class="switch ${dark?"on":""}" id="appearance-switch" aria-label="Toggle dark mode"><span></span></button></div>
        <button class="btn btn-secondary" id="appearance-reset" style="margin-top:14px">Reset to light</button>`;
    }
    else p.innerHTML=`<h2 class="section-title">Payroll</h2><p class="muted">Demo payroll configuration.</p><div class="notice">Amounts in this front-end demo are sample values and are not statutory calculations.</div><button class="btn btn-primary" data-action="process-payroll">Process Payroll</button>`;
    bindApp();
    $$('[data-theme-choice]').forEach(b=>b.onclick=()=>setTheme(b.dataset.themeChoice));
    const sw=$("#appearance-switch"); if(sw) sw.onclick=()=>setTheme(get(DB.settings,{}).theme==="dark"?"light":"dark");
    const ar=$("#appearance-reset"); if(ar) ar.onclick=()=>setTheme("light");
  }
  function toggleRow(title,text,key){const s=get(DB.settings,{});return `<div class="toggle-row"><div><strong>${title}</strong><div class="small muted">${text}</div></div><button class="switch ${s[key]?"on":""}" data-toggle-setting="${key}"><span></span></button></div>`}
  function saveSettings(){
    const s=get(DB.settings),p=$("#settings-panel");if(!p)return;
    ["businessName","address","phone","email"].forEach(k=>{const x=p.querySelector(`[name="${k}"]`);if(x)s[k]=x.value});
    set(DB.settings,s);toast("Settings saved.");
  }

  function logout(){saveSession(null);toast("Signed out.");location.hash="#login";render()}

  document.addEventListener("click",e=>{
    const t=e.target.closest("[data-action='change-password']");
    if(t)openChangePassword();
    const lg=e.target.closest("[data-action='logout']");
    if(lg)logout();
    const sw=e.target.closest("[data-toggle-setting]");
    if(sw){const s=get(DB.settings),k=sw.dataset.toggleSetting;s[k]=!s[k];set(DB.settings,s);settingsTab("notifications");toast("Notification preference updated.");}
  });

  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
  window.addEventListener("hashchange",render);

  seed();
  applyTheme();
  if(!location.hash)location.hash=getSession()?"#dashboard":"#login";
  render();
})();