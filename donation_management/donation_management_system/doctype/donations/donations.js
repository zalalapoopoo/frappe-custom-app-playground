// Copyright (c) 2024, Zaf and contributors
// For license information, please see license.txt

frappe.ui.form.on("Donations", {
    validate: function (frm) {
        if (frm.doc.total_amount === 0) {
            frappe.throw('Total Amount cannot be $0.00')
        }
    },
    async refresh(frm) {
        if (frm.is_new() && frm.doc.is_amended === undefined) {
            frm.set_value('donated_by_member', undefined)
            frm.set_value('donated_by_non_member', undefined)
            frm.set_value('donation_for_member', undefined)
            frm.set_value('donation_for_non_member', undefined)

            const default_currency = await frappe.db.get_single_value('Donation Management Settings', 'default_currency')
            frm.set_value('currency', default_currency)
            frm.set_currency_labels(['total_amount'], default_currency)
            frm.set_value('total_amount', 0)
        }


        frappe.ui.form.on("Donation Breakdown", {
            amount: function (table, cdt, cdn) {
                var row = locals[cdt][cdn]
                var total = 0
                table.doc.donation_breakdown.forEach(function (row) { total += row.amount })
                frm.set_value('total_amount', total)
                refresh_field('total_amount')
            },
            donation_breakdown_remove: function (table, cdt, cdn) {
                var row = locals[cdt][cdn]
                var total = 0
                table.doc.donation_breakdown.forEach(function (row) { total += row.amount })
                frm.set_value('total_amount', total)
                refresh_field('total_amount')
            }
        })

    },
    is_donor_a_non_member: function (frm) {
        frm.set_value('donated_by_member', undefined)
        frm.set_value('donated_by_non_member', undefined)
    },
    is_donation_for_a_non_member: async function (frm) {
        frm.set_value('donation_for_member', undefined)
        frm.set_value('donation_for_non_member', undefined)
        if (frm.doc.donated_by_member !== undefined) await get_member_auxiliary(frm, frm.doc.donated_by_member)
    },
    is_donation_on_behalf_of_someone_else: async function (frm) {
        frm.set_value('donation_for_member', undefined)
        frm.set_value('donation_for_non_member', undefined)
        if (frm.doc.donated_by_member !== undefined) await get_member_auxiliary(frm, frm.doc.donated_by_member)
    },
    donated_by_member: async function (frm) {
        if (frm.doc.donated_by_member === undefined || frm.doc.donation_for_member !== undefined) return

        if (frm.doc.is_donation_on_behalf_of_someone_else === true && frm.doc.donation_by_non_member !== undefined) {
            set_donation_breakdown_filters(frm, isMember = false)
            return
        }

        await get_member_auxiliary(frm, frm.doc.donated_by_member)
    },
    donation_for_member: async function (frm) {
        if (frm.doc.donation_for_member === undefined) return
        await get_member_auxiliary(frm, frm.doc.donation_for_member)
    },
    donated_by_non_member: function (frm) {
        if (frm.doc.donation_for_member !== undefined) return
        set_donation_breakdown_filters(frm, isMember = false)
    },
    donation_for_non_member: function (frm) {
        if (frm.doc.donation_for_non_member === undefined) return
        set_donation_breakdown_filters(frm, isMember = false)
        frm.set_value('auxiliary', undefined)
    },
});


async function get_member_auxiliary(frm, name, isReset = true) {
    const member_doc = await frappe.db.get_doc("Members", name)
    frm.set_value('auxiliary', member_doc.auxiliary)
    set_donation_breakdown_filters(frm, isMember = true, member_doc, isReset)
}

function set_donation_breakdown_filters(frm, isMember, member_doc = null, isReset = true) {
    if (!isMember) {
        frm.fields_dict['donation_breakdown'].grid.get_field('fund_name').get_query = function (frm, cdt, cdn) {
            return {
                filters: {
                    'is_enabled': true,
                    'applicable_only_for_member': false
                }
            }
        }
    }

    else {
        frm.fields_dict['donation_breakdown'].grid.get_field('fund_name').get_query = function (frm, cdt, cdn) {
            return {
                filters: [
                    ['is_enabled', '=', true],
                    ['auxiliary', 'in', [member_doc.auxiliary, '']],
                ]

            }
        }
    }

    if (isReset) frm.set_value('donation_breakdown', []);


}
