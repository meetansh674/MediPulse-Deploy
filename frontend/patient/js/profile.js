const profileElements={
    name:document.getElementById("profileName"),email:document.getElementById("profileEmail"),phone:document.getElementById("profilePhone"),role:document.getElementById("profileRole"),message:document.getElementById("profileMessage"),details:document.getElementById("profileDetails")
};
const editName=document.getElementById("editName"),editEmail=document.getElementById("editEmail"),editPhone=document.getElementById("editPhone");
function fillEdit(data){if(editName)editName.value=data?.name||"";if(editEmail)editEmail.value=data?.email||"";if(editPhone)editPhone.value=data?.phone||"";}
function renderProfile(data){
    if(profileElements.name)profileElements.name.textContent=data?.name||"—";
    if(profileElements.email)profileElements.email.textContent=data?.email||"—";
    if(profileElements.phone)profileElements.phone.textContent=data?.phone||"—";
    if(profileElements.role)profileElements.role.textContent=data?.role||"PATIENT";
    if(profileElements.details)profileElements.details.hidden=false;
    fillEdit(data);
}
async function loadProfile(){
    try{
        if(profileElements.message)profileElements.message.textContent="Loading your profile…";
        const data=await MPAuth.fetchJson("/users/me");
        if(!data||data.role!=="PATIENT")throw new Error("Unable to load the patient profile.");
        renderProfile(data);
        MPAuth.saveLogin({token:MPAuth.getToken(),user:data});
        if(profileElements.message)profileElements.message.textContent="";
    }catch(error){
    if(profileElements.message)profileElements.message.textContent=error.message||"Unable to load your profile.";
}
}

document.getElementById("profileEditForm")?.addEventListener("submit",async event=>{
    event.preventDefault();const button=event.submitter;button.disabled=true;
    try{const data=await MPAuth.fetchJson("/users/me",{method:"PUT",body:JSON.stringify({name:editName.value.trim(),email:editEmail.value.trim(),phone:editPhone.value.trim()||null})});renderProfile(data);MPAuth.saveLogin({token:MPAuth.getToken(),user:data});window.mpToast?.("Profile updated successfully.","success");}
    catch(error){window.mpToast?.(error.message,"error");}finally{button.disabled=false;}
});
document.getElementById("passwordForm")?.addEventListener("submit",async event=>{
    event.preventDefault();const button=event.submitter;button.disabled=true;
    try{await MPAuth.fetchJson("/users/me/password",{method:"PUT",body:JSON.stringify({currentPassword:document.getElementById("currentPassword").value,newPassword:document.getElementById("newPassword").value})});event.target.reset();window.mpToast?.("Password changed successfully.","success");}
    catch(error){window.mpToast?.(error.message,"error");}finally{button.disabled=false;}
});
loadProfile();
