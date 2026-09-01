Attribute VB_Name = "ExportActiefNaarSTEP"
'
' Inventor 2024 VBA-macro — Exporteer actief document naar STEP
' damianvink.nl/toolkit/macros
'
' Wat: slaat het actieve part of assembly op als .stp, naast het
' bestaande bestand, met dezelfde naam.
' Vereist: het document is al minstens één keer opgeslagen (heeft een pad).
' Basis-hulpmiddel, geen productiecode. Test eerst op een kopie.
'
' Installeren: Alt+F11 (VBA-editor) > Insert > Module > plak deze code.
'
Option Explicit

Sub ExportActiefNaarSTEP()

    Dim oDoc As Document
    Set oDoc = ThisApplication.ActiveDocument

    If oDoc Is Nothing Then
        MsgBox "Geen actief document.", vbExclamation
        Exit Sub
    End If

    If oDoc.FullFileName = "" Then
        MsgBox "Sla het document eerst één keer op (nog geen bestandspad).", vbExclamation
        Exit Sub
    End If

    ' Vaste, door Autodesk gedocumenteerde AddIn-id van de STEP-vertaler.
    Dim oStepTranslator As TranslatorAddIn
    Set oStepTranslator = ThisApplication.ApplicationAddIns.ItemById("{90AF7F40-0C01-11D5-8E83-0010B541CD80}")

    If oStepTranslator Is Nothing Then
        MsgBox "STEP-vertaler niet gevonden. Controleer of deze AddIn actief is.", vbCritical
        Exit Sub
    End If

    Dim oContext As TranslationContext
    Set oContext = ThisApplication.TransientObjects.CreateTranslationContext
    oContext.Type = kFileBrowseIOMechanism

    Dim oOptions As NameValueMap
    Set oOptions = ThisApplication.TransientObjects.CreateNameValueMap

    Dim oData As DataMedium
    Set oData = ThisApplication.TransientObjects.CreateDataMedium

    Dim stepPath As String
    stepPath = Left(oDoc.FullFileName, InStrRev(oDoc.FullFileName, ".")) & "stp"
    oData.FileName = stepPath

    If oStepTranslator.HasSaveCopyAsOptions(oDoc, oContext, oOptions) Then
        ' Standaardopties van de vertaler; pas hier evt. AP242/AP214 aan.
    End If

    Call oStepTranslator.SaveCopyAs(oDoc, oContext, oOptions, oData)

    MsgBox "Opgeslagen als:" & vbCrLf & stepPath, vbInformation

End Sub
