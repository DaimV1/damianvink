Attribute VB_Name = "SlaAllesOp"
'
' Inventor 2024 VBA-macro — Sla alle gewijzigde open documenten op
' damianvink.nl/toolkit/macros
'
' Wat: loopt door alle op dit moment geopende documenten en slaat elk
' document met niet-opgeslagen wijzigingen (Dirty) op. Documenten zonder
' wijzigingen worden overgeslagen.
' Basis-hulpmiddel, geen productiecode. Test eerst op een kopie.
'
' Installeren: Alt+F11 (VBA-editor) > Insert > Module > plak deze code.
'
Option Explicit

Sub SlaAllesOp()

    Dim oDoc As Document
    Dim saved As Integer
    Dim skipped As Integer
    saved = 0
    skipped = 0

    For Each oDoc In ThisApplication.Documents
        If oDoc.Dirty Then
            If oDoc.FullFileName = "" Then
                skipped = skipped + 1
            Else
                oDoc.Save
                saved = saved + 1
            End If
        Else
            skipped = skipped + 1
        End If
    Next

    MsgBox saved & " document(en) opgeslagen." & vbCrLf & _
           skipped & " overgeslagen (geen wijzigingen, of nog niet opgeslagen).", vbInformation

End Sub
