Q=@

help:
	@cat help.txt

check: static test

static test clean cleanup:
	$(Q)echo $(@) is not implemented yet
