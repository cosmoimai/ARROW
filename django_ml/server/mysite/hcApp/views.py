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

symptoms_array = ['receiving_blood_transfusion', 'red_sore_around_nose',
       'abnormal_menstruation', 'continuous_sneezing', 'breathlessness',
       'blackheads', 'shivering', 'dizziness', 'back_pain', 'unsteadiness',
       'yellow_crust_ooze', 'muscle_weakness', 'loss_of_balance', 'chills',
       'ulcers_on_tongue', 'stomach_bleeding', 'lack_of_concentration', 'coma',
       'neck_pain', 'weakness_of_one_body_side', 'diarrhoea',
       'receiving_unsterile_injections', 'headache', 'family_history',
       'fast_heart_rate', 'pain_behind_the_eyes', 'sweating', 'mucoid_sputum',
       'spotting_ urination', 'sunken_eyes', 'dischromic _patches', 'nausea',
       'dehydration', 'loss_of_appetite', 'abdominal_pain', 'stomach_pain',
       'yellowish_skin', 'altered_sensorium', 'chest_pain', 'muscle_wasting',
       'vomiting', 'mild_fever', 'high_fever', 'red_spots_over_body',
       'dark_urine', 'itching', 'yellowing_of_eyes', 'fatigue', 'joint_pain',
       'muscle_pain']

cwd = pathlib.Path(__file__).parent.absolute()

df = pd.read_csv(os.path.join(cwd, 'Training.csv'))
df_test = pd.read_csv(os.path.join(cwd, 'Testing.csv'))

X_train = df[['receiving_blood_transfusion', 'red_sore_around_nose',
       'abnormal_menstruation', 'continuous_sneezing', 'breathlessness',
       'blackheads', 'shivering', 'dizziness', 'back_pain', 'unsteadiness',
       'yellow_crust_ooze', 'muscle_weakness', 'loss_of_balance', 'chills',
       'ulcers_on_tongue', 'stomach_bleeding', 'lack_of_concentration', 'coma',
       'neck_pain', 'weakness_of_one_body_side', 'diarrhoea',
       'receiving_unsterile_injections', 'headache', 'family_history',
       'fast_heart_rate', 'pain_behind_the_eyes', 'sweating', 'mucoid_sputum',
       'spotting_ urination', 'sunken_eyes', 'dischromic _patches', 'nausea',
       'dehydration', 'loss_of_appetite', 'abdominal_pain', 'stomach_pain',
       'yellowish_skin', 'altered_sensorium', 'chest_pain', 'muscle_wasting',
       'vomiting', 'mild_fever', 'high_fever', 'red_spots_over_body',
       'dark_urine', 'itching', 'yellowing_of_eyes', 'fatigue', 'joint_pain',
       'muscle_pain']]

X_test = df_test[['receiving_blood_transfusion', 'red_sore_around_nose',
       'abnormal_menstruation', 'continuous_sneezing', 'breathlessness',
       'blackheads', 'shivering', 'dizziness', 'back_pain', 'unsteadiness',
       'yellow_crust_ooze', 'muscle_weakness', 'loss_of_balance', 'chills',
       'ulcers_on_tongue', 'stomach_bleeding', 'lack_of_concentration', 'coma',
       'neck_pain', 'weakness_of_one_body_side', 'diarrhoea',
       'receiving_unsterile_injections', 'headache', 'family_history',
       'fast_heart_rate', 'pain_behind_the_eyes', 'sweating', 'mucoid_sputum',
       'spotting_ urination', 'sunken_eyes', 'dischromic _patches', 'nausea',
       'dehydration', 'loss_of_appetite', 'abdominal_pain', 'stomach_pain',
       'yellowish_skin', 'altered_sensorium', 'chest_pain', 'muscle_wasting',
       'vomiting', 'mild_fever', 'high_fever', 'red_spots_over_body',
       'dark_urine', 'itching', 'yellowing_of_eyes', 'fatigue', 'joint_pain',
       'muscle_pain']]

y_train = df.iloc[:,-1]
y_test = df_test.iloc[:,-1]
# print(y_test)


clf2=RandomForestClassifier(n_estimators=100)
clf2.fit(X_train,y_train)
y_pred=clf2.predict(X_test)
# print("Accuracy:",metrics.accuracy_score(y_test, y_pred))

df_copy = X_train.iloc[0:1,:].copy()
df_copy.append(pd.Series(), ignore_index=True)
for c in df_copy.columns:
    df_copy[c] = 0


print(df_copy)



def get_disease(model, df):
    y_true = model.predict_proba(df)
    # print(y_true)
    return y_true

@csrf_exempt 
def index(request):
    if request.method == 'POST':
        try:
            print(request)
            body = json.loads(request.body)
            print(body)
            symptoms = body['symptoms']
            print(symptoms)
            new_df_copy = copy.deepcopy(df_copy)
            for symptom in symptoms:
                    new_df_copy[symptoms_array[int(symptom)]] = 1
            da = get_disease(clf2, new_df_copy)[0]
            print(da)
            # print(str(da))
            # print(list(da))
            lda = list(da)
            print(sum(da))
            dic = {
                'result' : lda
            }
            return JsonResponse(dic, safe=False)
        except:
            return JsonResponse({'error':True, 'message': "invalid symptoms chosen"}, safe=False)
        










# , 'muscle_wasting'
# , 'burning_micturition'
# , 'lethargy'
# , 'yellow_crust_ooze'
# , 'scurring'
# , 'palpitations'
# , 'blood_in_sputum'
# , 'rusty_sputum',
# family_history
# polyuria
# , 'dischromic _patches'
# , 'toxic_look_(typhos)'
# extra_marital_contacts
# swollen_extremeties
# bloody_stool
# phlegm
# malaise
# swelled_lymph_nodes

# ['receiving_blood_transfusion', 'red_sore_around_nose',
#        'abnormal_menstruation', 'continuous_sneezing', 'breathlessness',
#        'blackheads', 'shivering', 'dizziness', 'back_pain', 'unsteadiness',
#        'yellow_crust_ooze', 'muscle_weakness', 'loss_of_balance', 'chills',
#        'ulcers_on_tongue', 'stomach_bleeding', 'lack_of_concentration', 'coma',
#        'neck_pain', 'weakness_of_one_body_side', 'diarrhoea',
#        'receiving_unsterile_injections', 'headache', 'family_history',
#        'fast_heart_rate', 'pain_behind_the_eyes', 'sweating', 'mucoid_sputum',
#        'spotting_ urination', 'sunken_eyes', 'dischromic _patches', 'nausea',
#        'dehydration', 'loss_of_appetite', 'abdominal_pain', 'stomach_pain',
#        'yellowish_skin', 'altered_sensorium', 'chest_pain', 'muscle_wasting',
#        'vomiting', 'mild_fever', 'high_fever', 'red_spots_over_body',
#        'dark_urine', 'itching', 'yellowing_of_eyes', 'fatigue', 'joint_pain',
#        'muscle_pain']