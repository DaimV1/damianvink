Attribute VB_Name = "ToonIProperties"
'
' Inventor 2024 VBA-macro — Toon iProperties van het actieve document
' damianvink.nl/toolkit/macros
'
' Wat: leest Titel, Auteur, Onderwerp en Trefwoorden uit de
' samenvattingsgegevens (Summary) van het actieve document en toont ze
' in een berichtvenster. Alleen-lezen, wijzigt niets.
'
' Installeren: Alt+F11 (VBA-editor) > Insert > Module > plak deze code.
'
Option Explicit

Sub ToonIProperties()

    Dim oDoc As Document
    Set oDoc = ThisApplication.ActiveDocument

    If oDoc Is Nothing Then
        MsgBox "Geen actief document.", vbExclamation
        Exit Sub
    End If

    Dim oSummary As PropertySet
    Set oSummary = oDoc.PropertySets.Item("Inventor Summary Information")

    Dim msg As String
    msg = "Titel: " & oSummary.Item("Title").Value & vbCrLf
    msg = msg & "Auteur: " & oSummary.Item("Author").Value & vbCrLf
    msg = msg & "Onderwerp: " & oSummary.Item("Subject").Value & vbCrLf
    msg = msg & "Trefwoorden: " & oSummary.Item("Keywords").Value

    MsgBox msg, vbInformation, "iProperties — " & oDoc.DisplayName

End Sub
