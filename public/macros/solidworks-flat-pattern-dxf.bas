Attribute VB_Name = "ExporteerVlakPatroonNaarDXF"
'
' SolidWorks 2024 VBA-macro — Exporteer vlak patroon naar DXF
' damianvink.nl/toolkit/macros
'
' Wat: zoekt de Flat-Pattern-feature van het actieve plaatwerk-part,
' schakelt die tijdelijk in (unsuppress) als dat nodig is, slaat het
' vlakke patroon op als .dxf naast het bestaande bestand, en zet de
' feature daarna terug naar de oorspronkelijke staat.
' Vereist: het actieve document is een plaatwerk-part met een
' Flat-Pattern-feature, en is al minstens één keer opgeslagen.
' Zie ook de rekenhulp Richtlijnen kanten op deze site voor Ri,
' beenlengte en Z-buiging bij het plaatwerkontwerp zelf.
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

    If swModel.GetType <> swDocPART Then
        MsgBox "Geen part-document. Open een plaatwerk-part.", vbExclamation
        Exit Sub
    End If

    Dim docPath As String
    docPath = swModel.GetPathName

    If docPath = "" Then
        MsgBox "Sla het document eerst één keer op (nog geen bestandspad).", vbExclamation
        Exit Sub
    End If

    ' Zoek de Flat-Pattern-feature op type, niet op naam (naam kan
    ' afwijken door taal of hernoemen).
    Dim swFeat As SldWorks.Feature
    Set swFeat = swModel.FirstFeature

    Dim swFlatFeat As SldWorks.Feature
    Do While Not swFeat Is Nothing
        If swFeat.GetTypeName2 = "FlatPattern" Then
            Set swFlatFeat = swFeat
            Exit Do
        End If
        Set swFeat = swFeat.GetNextFeature
    Loop

    If swFlatFeat Is Nothing Then
        MsgBox "Geen Flat-Pattern-feature gevonden. Is dit een plaatwerk-part?", vbExclamation
        Exit Sub
    End If

    Dim wasSuppressed As Boolean
    wasSuppressed = swFlatFeat.IsSuppressed

    If wasSuppressed Then
        swFlatFeat.SetSuppression2 swUnSuppressFeature, swThisConfiguration, Nothing
    End If

    Dim dxfPath As String
    dxfPath = Left(docPath, InStrRev(docPath, ".")) & "dxf"

    Dim saveErrors As Long
    Dim saveWarnings As Long
    Dim ok As Boolean
    ok = swModel.Extension.SaveAs(dxfPath, swSaveAsCurrentVersion, swSaveAsOptions_Silent, Nothing, saveErrors, saveWarnings)

    If wasSuppressed Then
        swFlatFeat.SetSuppression2 swSuppressFeature, swThisConfiguration, Nothing
    End If

    If ok And saveErrors = 0 Then
        MsgBox "Opgeslagen als:" & vbCrLf & dxfPath, vbInformation
    Else
        MsgBox "Exporteren mislukt (foutcode " & saveErrors & ").", vbCritical
    End If

End Sub
