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

    ' ActiveDocument raises when no document is open (it does not return
    ' Nothing), so check Documents.Count first rather than testing the
    ' result of ActiveDocument for Nothing.
    If ThisApplication.Documents.Count = 0 Then
        MsgBox "Geen actief document.", vbExclamation
        Exit Sub
    End If

    Dim oDoc As Document
    Set oDoc = ThisApplication.ActiveDocument

    If oDoc.FullFileName = "" Then
        MsgBox "Sla het document eerst één keer op (nog geen bestandspad).", vbExclamation
        Exit Sub
    End If

    If InStrRev(oDoc.FullFileName, ".") = 0 Then
        MsgBox "Bestandspad heeft geen extensie.", vbExclamation
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

    ' Application protocol wordt hier vast gezet — anders bepaalt de laatst
    ' gebruikte UI-instelling stilzwijgend welk protocol de export gebruikt.
    ' Kies AP242 (moderne standaard) of AP214 (breder ondersteund, ouder);
    ' controleer de exacte enum-naam in de Inventor Object Browser (VBA-editor,
    ' F2) onder ApplicationProtocolTypeEnum voor jouw Inventor-versie.
    If oStepTranslator.HasSaveCopyAsOptions(oDoc, oContext, oOptions) Then
        oOptions.Value("ApplicationProtocolType") = kAP242ApplicationProtocolType
    End If

    Call oStepTranslator.SaveCopyAs(oDoc, oContext, oOptions, oData)

    MsgBox "Opgeslagen als:" & vbCrLf & stepPath, vbInformation

End Sub
