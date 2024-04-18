# Copyright (c) 2024, Zaf and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.naming import now_datetime, make_autoname


class Donations(Document):
	def autoname(self):
		current_datetime = now_datetime()
		month = current_datetime.strftime("%b").upper()
		year = current_datetime.strftime("%y")
		
		prefix = "{}{}".format(month, year)

		if not self.donated_by_member: 
			prefix += "-{}".format(self.donated_by_non_member)
		else:
			prefix += "-{}".format(self.donated_by_member)

		if self.is_donation_on_behalf_of_someone_else:
			if not self.donation_for_member:
				prefix += "-{}".format(self.donation_for_non_member)
			else:
				prefix += "-{}".format(self.donation_for_member)

		self.name = make_autoname(prefix + '-.####')

