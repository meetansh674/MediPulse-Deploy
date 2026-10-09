package com.medipulse.backend.service;

import com.medipulse.backend.dto.HealthReadingRequest;
import com.medipulse.backend.entity.Alert;
import com.medipulse.backend.entity.HealthReading;
import com.medipulse.backend.entity.User;
import com.medipulse.backend.exception.ForbiddenException;
import com.medipulse.backend.exception.ResourceNotFoundException;
import com.medipulse.backend.repository.HealthReadingRepository;
import com.medipulse.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;

@Service
public class HealthReadingService {
    private final HealthReadingRepository healthReadingRepository; private final UserRepository userRepository; private final PatientAccessService patientAccessService; private final AlertService alertService;
    public HealthReadingService(HealthReadingRepository repo,UserRepository users,PatientAccessService access,AlertService alerts){healthReadingRepository=repo;userRepository=users;patientAccessService=access;alertService=alerts;}
    public HealthReading createReading(HealthReadingRequest request){
        User patient=getPatient(request.getPatientId()); User current=getCurrentUser(); patientAccessService.assertCanAccessPatient(current,patient.getUserId());
        String type=request.getReadingType().trim().toUpperCase(Locale.ROOT); double value=validateValue(type,request.getValue());
        HealthReading r=new HealthReading();r.setPatient(patient);r.setReadingType(type);r.setValue(formatValue(value));r.setUnit(request.getUnit());r.setRecordedAt(request.getRecordedAt()); HealthReading saved=healthReadingRepository.save(r);
        Alert.Status status=alertStatus(type,value); if(status!=Alert.Status.NORMAL) alertService.createAlert(patient.getUserId(),status,buildMessage(type,value,status));
        return saved;
    }
public List<HealthReading> getPatientReadings(Long patientId){User patient=getPatient(patientId);User current=getCurrentUser();patientAccessService.assertCanAccessPatient(current,patient.getUserId());return healthReadingRepository.findByPatientUserIdOrderByRecordedAtDesc(patientId);}
private double validateValue(String type,String raw){final double v;try{v=Double.parseDouble(raw.trim());}catch(Exception e){throw new IllegalArgumentException("Health reading value must be numeric");}
    switch(type){case "HEART_RATE" -> range(v,20,250,"Heart rate");case "SPO2","OXYGEN_SATURATION" -> range(v,50,100,"SpO2");case "TEMPERATURE" -> range(v,30,45,"Temperature");case "SYSTOLIC_BP" -> range(v,50,250,"Systolic blood pressure");case "DIASTOLIC_BP" -> range(v,30,150,"Diastolic blood pressure");case "BLOOD_GLUCOSE" -> range(v,20,600,"Blood glucose");default -> range(v,-1000000,1000000,"Reading");} return v;}
private void range(double v,double min,double max,String label){if(v<min||v>max)throw new IllegalArgumentException(label+" must be between "+min+" and "+max);}
private Alert.Status alertStatus(String type,double v){return switch(type){case "HEART_RATE"->(v<50||v>120)?Alert.Status.ATTENTION:(v<60||v>100)?Alert.Status.WARNING:Alert.Status.NORMAL;case "SPO2","OXYGEN_SATURATION"->v<90?Alert.Status.ATTENTION:v<95?Alert.Status.WARNING:Alert.Status.NORMAL;case "TEMPERATURE"->(v>=39||v<35)?Alert.Status.ATTENTION:(v>=38||v<36)?Alert.Status.WARNING:Alert.Status.NORMAL;case "SYSTOLIC_BP"->(v>=180||v<90)?Alert.Status.ATTENTION:(v>=140||v<100)?Alert.Status.WARNING:Alert.Status.NORMAL;case "DIASTOLIC_BP"->(v>=120||v<60)?Alert.Status.ATTENTION:(v>=90||v<65)?Alert.Status.WARNING:Alert.Status.NORMAL;case "BLOOD_GLUCOSE"->(v>=300||v<54)?Alert.Status.ATTENTION:(v>=200||v<70)?Alert.Status.WARNING:Alert.Status.NORMAL;default->Alert.Status.NORMAL;};}
private String buildMessage(String type,double v,Alert.Status status){return status+": "+type.replace('_',' ')+" reading of "+formatValue(v)+" is outside the expected range.";}
private String formatValue(double v){if(v==Math.rint(v)&&!Double.isInfinite(v))return Long.toString((long)v);return String.valueOf(v);}
private User getPatient(Long id){User u=userRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Patient not found"));if(u.getRole()!=User.Role.PATIENT)throw new IllegalArgumentException("User is not a patient");return u;}
private User getCurrentUser(){Authentication a=SecurityContextHolder.getContext().getAuthentication();if(a==null||!a.isAuthenticated()||!(a.getPrincipal() instanceof Long id))throw new ForbiddenException("User not authenticated");return userRepository.findById(id).orElseThrow(()->new ForbiddenException("Authenticated user not found"));}
}
