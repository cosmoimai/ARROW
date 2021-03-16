from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import numpy as np 
import pandas as pd 
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn import preprocessing
from sklearn import metrics
from sklearn.metrics import classification_report
import os
import pathlib
import json
import demjson
import copy

symptoms_array = ['itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition', 'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation', 
'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness', 'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine', 'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes', 'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption', 'fluid_overload.1', 'blood_in_sputum', 'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze']

cwd = pathlib.Path(__file__).parent.absolute()
# print(cwd)
df = pd.read_csv(str(cwd) + '\Training.csv')

df_test = pd.read_csv(str(cwd) + '\Testing.csv')
a = ""
for col in df_test.columns: 
    a+="'"+col+"', "

# print(a)
le = preprocessing.LabelEncoder()
le.fit(pd.concat([df['prognosis'], df_test['prognosis']]))

model = RandomForestClassifier()
model.fit(df[df.columns.difference(['prognosis'])], le.fit_transform(df['prognosis']))
y_pred=model.predict(df_test[df_test.columns.difference(['prognosis'])])

y_true = le.fit_transform(df_test['prognosis'])
def get_disease(model, df, le):
    y_true = model.predict_proba(df)
    return y_true
df_copy = df.iloc[0:1,:].copy()
df_copy.append(pd.Series(), ignore_index=True)
for c in df_copy.columns:
    df_copy[c] = 0

df_copy = df_copy[df_copy.columns.difference(['prognosis'])]
# print(get_disease(model, df_copy, le)[0])
# print(df_copy)
# print(df_copy)

# print("============================================")
# print(list(df_test['prognosis']))

@csrf_exempt 
def index(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        symptoms = body['symptoms']
        print(symptoms)
        new_df_copy = copy.deepcopy(df_copy)
        for symptom in symptoms:
                new_df_copy[symptoms_array[int(symptom)]] = 1
        da = get_disease(model, new_df_copy, le)[0]
        print(da)
        # print(str(da))
        # print(list(da))
        lda = list(da)
        dic = {
            'result' : lda
        }
        return JsonResponse(dic, safe=False)