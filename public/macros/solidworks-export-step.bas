Attribute VB_Name = "ExportActiefNaarSTEP"
'
' SolidWorks 2024 VBA-macro — Exporteer actief document naar STEP
' damianvink.nl/toolkit/macros
'
' Wat: slaat het actieve part of assembly op als .step, naast het
' bestaande bestand, met dezelfde naam.
' Vereist: het document is al minstens één keer opgeslagen (heeft een pad).
' Basis-hulpmiddel, geen productiecode. Test eerst op een kopie.
'
' Installeren: Tools > Macro > New, plak deze code in de module (of
' importeer dit .bas-bestand direct via VBA-editor > File > Import File).
'
Option Explicit

Dim swApp As SldWorks.SldWorks
Dim swModel As SldWorks.ModelDoc2

Sub main()

    Set swApp = Application.SldWorks
    Set swModel = swApp.ActiveDoc

    If swModel Is Nothing Then
        MsgBox "Geen actief document.", vbExclamation
        Exit Sub
    End If

    Dim docPath As String
    docPath = swModel.GetPathName

    If docPath = "" Then
        MsgBox "Sla het document eerst één keer op (nog geen bestandspad).", vbExclamation
        Exit Sub
    End If

    Dim stepPath As String
    stepPath = Left(docPath, InStrRev(docPath, ".")) & "step"

    Dim saveErrors As Long
    Dim saveWarnings As Long

    Dim ok As Boolean
    ok = swModel.Extension.SaveAs(stepPath, swSaveAsCurrentVersion, swSaveAsOptions_Silent, Nothing, saveErrors, saveWarnings)

    If ok And saveErrors = 0 Then
        MsgBox "Opgeslagen als:" & vbCrLf & stepPath, vbInformation
    Else
        MsgBox "Exporteren mislukt (foutcode " & saveErrors & ").", vbCritical
    End If

End Sub
