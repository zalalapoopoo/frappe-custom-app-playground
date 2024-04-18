# Copyright (c) 2024, Zaf and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime # from python std library
from frappe.utils import getdate

class Members(Document):

	@property
	def age(self):
		age = Members.get_age(self)
		return age
	
	@property
	def auxiliary(self):
		auxiliary_body = Members.get_auxiliary(self)
		return auxiliary_body
	
	@auxiliary.setter
	def auxiliary(self, value):
		# value from parameter can be used if any logic to be handled with previous data before save is completed.
		pass
	
	def get_age(self):
		dob = self.dob
		if type(dob) == str:
			dob = datetime.strptime(dob, "%Y-%m-%d").date()
		today = getdate()
		age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
		return age
	
	def get_auxiliary(self):
		age = Members.get_age(self)
		gender = self.gender

		auxiliary_filters = {
			'gender': ('=', gender),
			'start_age': ('<=', age)
		}

		member_assigned_auxiliary =  frappe.get_all('Auxiliary', filters=auxiliary_filters, fields=['body_name', 'start_age'], order_by='start_age desc', limit_page_length=1)

		return member_assigned_auxiliary[0].body_name if member_assigned_auxiliary else None

		
