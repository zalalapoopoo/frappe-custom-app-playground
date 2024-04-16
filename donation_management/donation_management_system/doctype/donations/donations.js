// Copyright (c) 2024, Zaf and contributors
// For license information, please see license.txt

frappe.ui.form.on("Donations", {
    refresh(frm) {

    },
    is_donor_a_non_member: function (frm) {
        frm.set_value('donated_by_member', null)
        frm.set_value('donated_by_non_member', null)
    },
    is_donated_for_a_non_member: function (frm) {
        frm.set_value('donated_for_member', null)
        frm.set_value('donated_for_non_member', null)
    },
    is_donation_on_behalf_of_someone_else: function (frm) {
        frm.set_value('donated_for_member', null)
        frm.set_value('donated_for_non_member', null)
    }
});
