import numpy as np 
import pandas as pd 
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn import preprocessing
from sklearn import metrics
from sklearn.metrics import classification_report
df = pd.read_csv('F:/trying_dataset/Training.csv')
df_test = pd.read_csv('F:/trying_dataset/Testing.csv')
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
print(get_disease(model, df_copy, le)[0])