Attribute VB_Name = "ToonCustomProperties"
'
' SolidWorks 2024 VBA-macro — Toon custom properties van het actieve document
' damianvink.nl/toolkit/macros
'
' Wat: leest alle custom properties (configuratie-onafhankelijk, "") van
' het actieve document en toont ze in een berichtvenster. Alleen-lezen,
' wijzigt niets.
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

    Dim swCustProp As SldWorks.CustomPropertyManager
    Set swCustProp = swModel.Extension.CustomPropertyManager("")

    Dim propNames As Variant
    propNames = swCustProp.GetNames

    If IsEmpty(propNames) Then
        MsgBox "Geen custom properties gevonden.", vbInformation
        Exit Sub
    End If

    Dim msg As String
    Dim i As Long

    For i = 0 To UBound(propNames)
        Dim valOut As String
        Dim resolvedVal As String
        Dim wasResolved As Boolean
        swCustProp.Get5 propNames(i), False, valOut, resolvedVal, wasResolved
        msg = msg & propNames(i) & " = " & resolvedVal & vbCrLf
    Next i

    MsgBox msg, vbInformation, "Custom properties — " & swModel.GetTitle

End Sub
